const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository');
const AppError = require('../../utils/AppError');
const mailService = require('../../services/mailService');
const NotificationService = require('../notifications/notifications.service');
const { pool } = require('../../config/db');

class AuthService {
    async register(userData) {
        const { password, role, referral_code } = userData;
        const name = userData.name || userData.full_name || 'New Member';
        const email = userData.email?.trim().toLowerCase();
        const phone = userData.phone?.trim() || null;

        // 1. Check existing
        const userExists = await authRepository.findByEmail(email);
        if (userExists) throw new AppError('User with this email already exists.', 400);

        if (phone) {
            const phoneExists = await authRepository.findByPhone(phone);
            if (phoneExists) throw new AppError('User with this phone number already exists.', 400);
        }

        // 2. Handle referral link
        let referredById = null;
        if (referral_code) {
            referredById = await this._processReferralCode(referral_code, role);
        }

        // 3. Hash password
        const salt = await bcrypt.genSalt(8);
        const password_hash = await bcrypt.hash(password, salt);

        // 4. Generate Referral Code
        const generatedReferralCode = await this._generateUniqueReferralCode(role);

        // 5. Create User
        const user = await authRepository.create({
            phone,
            email,
            password_hash,
            role,
            full_name: name,
            referral_code: generatedReferralCode,
            referred_by: referredById,
            status: referredById ? 'PENDING' : 'ACTIVE'
        });

        // 6. Side Effects (Background tasks)
        this._handlePostRegistrationEffects(user, name, email, referredById, role, generatedReferralCode, phone);

        return user;
    }

    async login(email, password) {
        if (!email || !password) throw new AppError('Please provide both email and password.', 400);

        const user = await authRepository.findByIdentifier(email.trim().toLowerCase());
        if (!user) throw new AppError('Invalid email or password.', 401);

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) throw new AppError('Invalid email or password.', 401);

        if (user.status === 'PENDING') throw new AppError('Your account is pending approval by the admin.', 403);
        if (user.status === 'BLOCKED') throw new AppError('Your account has been blocked. Please contact support.', 403);

        const token = this.generateToken(user.id, user.role);

        return { token, user };
    }

    generateToken(id, role) {
        return jwt.sign({ id, role }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });
    }

    async _processReferralCode(referral_code, role) {
        const isVendorReferral = referral_code.endsWith('-V');
        const isUserReferral = referral_code.endsWith('-U');
        const cleanCode = referral_code.replace(/-[UV]$/, '');
        
        const referrer = await authRepository.findByReferralCode(cleanCode);
        if (!referrer) return null;

        if (isVendorReferral && role === 'vendor') {
            if (referrer.referred_by) throw new AppError('This referral link is only valid for users, not vendors.', 403);
            return referrer.id;
        } else if (isUserReferral && role === 'user') {
            return referrer.id;
        } else if (!isVendorReferral && !isUserReferral) {
            return referrer.id;
        } else {
            throw new AppError('Invalid referral code for the selected role.', 400);
        }
    }

    async _generateUniqueReferralCode(role) {
        const generateSafeCode = () => {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let code = '';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            const prefix = role === 'vendor' ? 'VND' : 'USR';
            return `${prefix}-${code}${Date.now().toString(36).slice(-2).toUpperCase()}`;
        };

        let code = generateSafeCode();
        let exists = await authRepository.findByReferralCode(code);
        while (exists) {
            code = generateSafeCode();
            exists = await authRepository.findByReferralCode(code);
        }
        return code;
    }

    async _handlePostRegistrationEffects(user, name, email, referredById, role, generatedReferralCode, phone) {
        // Vendor Sync
        if (role === 'vendor') {
            pool.query(
                'INSERT INTO vendors (name, phone, email, referral_code, referred_by_vendor_id, status) VALUES ($1, $2, $3, $4, $5, $6)',
                [name, phone, email, generatedReferralCode, referredById, 'Active']
            ).catch(err => console.error('[VENDOR SYNC ERROR]', err.message));
        }

        // Welcome Email
        mailService.sendWelcomeEmail(email, name || 'User').catch(err => console.error('[EMAIL ERROR]', err.message));

        // Welcome Notification
        NotificationService.sendPushToUserId(user.id, 'Welcome!', 'Thank you for joining our platform.', {
            type: 'WELCOME', target: '/dashboard'
        }).catch(err => console.error('[NOTIF ERROR]', err.message));

        // Parent Notification
        if (referredById) {
            const subject = role === 'vendor' ? 'New Sub-Vendor Request' : 'New User Referral Request';
            NotificationService.sendPushToUserId(referredById, subject, `${name} is waiting for approval.`, {
                type: role === 'vendor' ? 'SUB_VENDOR_REQUEST' : 'USER_REFERRAL_REQUEST',
                target: '/referrals'
            }).catch(err => console.error('[PARENT NOTIF ERROR]', err.message));

            if (role === 'user') {
                pool.query(
                    'INSERT INTO referrals (referrer_id, referred_user_id, commission_earned, created_at) VALUES ($1, $2, $3, NOW())',
                    [referredById, user.id, 0]
                ).catch(err => console.error('[REFERRAL RECORD ERROR]', err.message));
            }
        }
    }
}

module.exports = new AuthService();
