const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { findUserByPhone, findUserByEmail, createUser, findUserByReferralCode, findUserByIdentifier } = require('../models/userModel');
const mailService = require('../services/mailService');
const NotificationService = require('../services/notificationService');


// --- Helper functions ---
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secretkey123', {
        expiresIn: '7d',
    });
};

const registerUser = async (req, res, next) => {
    try {
        const { password, role, referral_code } = req.body;
        const name = req.body.name || req.body.full_name || 'New Member';
        const email = req.body.email?.trim().toLowerCase();
        const phone = req.body.phone?.trim() || null;

        // validation
        if (!email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Please provide email, password and role.' });
        }

        // Role check
        if (!['user', 'vendor', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role.' });
        }

        // Check existing
        const userExists = await findUserByEmail(email);
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User with this email already exists.' });
        }

        // Check existing phone
        if (phone) {
            const phoneExists = await findUserByPhone(phone);
            if (phoneExists) {
                return res.status(400).json({ success: false, message: 'User with this phone number already exists.' });
            }
        }

        // Handle referral link
        let referredById = null;
        
        if (referral_code) {
            const isVendorReferral = referral_code.endsWith('-V');
            const isUserReferral = referral_code.endsWith('-U');
            const cleanCode = referral_code.replace(/-[UV]$/, '');
            
            const referrer = await findUserByReferralCode(cleanCode);
            if (referrer) {
                if (isVendorReferral && role === 'vendor') {
                    if (referrer.referred_by) {
                        return res.status(403).json({ success: false, message: 'This referral link is only valid for users, not vendors.' });
                    }
                    referredById = referrer.id;
                } else if (isUserReferral && role === 'user') {
                    referredById = referrer.id;
                } else if (!isVendorReferral && !isUserReferral) {
                    referredById = referrer.id;
                } else {
                    return res.status(400).json({ success: false, message: 'Invalid referral code for the selected role.' });
                }
            }
        }

        // Hash password
        // Reduced salt from 10 to 8 for EXTREME scalability. 
        // 8 is still secure but 4x faster to process on CPU, preventing event loop blocking.
        const salt = await bcrypt.genSalt(8);
        const password_hash = await bcrypt.hash(password, salt);

        // --- Generate Unique Unguessable Referral Code ---
        const generateSafeCode = () => {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O, 0, I, 1 to avoid confusion
            let code = '';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            const prefix = role === 'vendor' ? 'VND' : 'USR';
            return `${prefix}-${code}${Date.now().toString(36).slice(-2).toUpperCase()}`;
        };

        let generatedReferralCode = generateSafeCode();
        
        // Safety check for collisions (though extremely unlikely with timestamp suffix)
        let isCollision = await findUserByReferralCode(generatedReferralCode);
        while (isCollision) {
            generatedReferralCode = generateSafeCode();
            isCollision = await findUserByReferralCode(generatedReferralCode);
        }

        const user = await createUser({
            phone,
            email,
            password_hash,
            role,
            full_name: name,
            referral_code: generatedReferralCode,
            referred_by: referredById,
            status: referredById ? 'PENDING' : 'ACTIVE' // Everyone referred needs approval, organic signups are ACTIVE
        });

        // --- SYNCHRONIZATION: Add to vendors table for Admin visibility ---
        if (role === 'vendor') {
            try {
                const { pool } = require('../config/db');
                await pool.query(
                    'INSERT INTO vendors (name, phone, email, referral_code, referred_by_vendor_id, status) VALUES ($1, $2, $3, $4, $5, $6)',
                    [name, phone, email, generatedReferralCode, referredById, 'Active']
                );
            } catch (vErr) {
                console.error('[VENDOR SYNC ERROR] Failed to create vendor metadata:', vErr.message);
            }
        }

        // Send Welcome Email (non-blocking)
        mailService.sendWelcomeEmail(email, name || 'User').catch(err => {
            console.error('[REGISTRATION EMAIL ERROR]', err.message);
        });

        // Send In-App Bell Notification
        NotificationService.sendPushToUserId(user.id, 'Welcome!', 'Thank you for joining our platform.', {
            type: 'WELCOME',
            target: '/dashboard'
        }).catch(err => {
            console.error('[BELL NOTIFICATION ERROR]', err.message);
        });

        // Notify parent vendor if this is a referral
        if (referredById) {
            const subject = role === 'vendor' ? 'New Sub-Vendor Request' : 'New User Referral Request';
            const messageText = `${name || 'Someone'} has registered using your referral code and is waiting for your approval.`;
            
            NotificationService.sendPushToUserId(referredById, subject, messageText, {
                type: role === 'vendor' ? 'SUB_VENDOR_REQUEST' : 'USER_REFERRAL_REQUEST',
                target: '/referrals'
            }).catch(err => {
                console.error('[PARENT NOTIFICATION ERROR]', err.message);
            });
        }

        // Record standard referral for "Refer & Earn" tracking
        if (referredById && role === 'user') {
            try {
                await pool.query(
                    'INSERT INTO referrals (referrer_id, referred_user_id, commission_earned, created_at) VALUES ($1, $2, $3, NOW())',
                    [referredById, user.id, 0]
                );
            } catch (refErr) {
                console.error('[REFERRAL RECORD ERROR] Failed to log referral link:', refErr.message);
            }
        }

        res.status(201).json({

            success: true,
            message: role === 'vendor' 
                ? 'Registration successful. Please wait for admin approval.' 
                : 'User registered successfully.',
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status
            },
        });
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
        }

        const user = await findUserByIdentifier(email.trim().toLowerCase());

        if (user) {
            const isMatch = await bcrypt.compare(password, user.password_hash);

            if (isMatch) {
                if (user.status === 'PENDING') {
                    return res.status(403).json({ success: false, message: 'Your account is pending approval by the admin.' });
                }
                if (user.status === 'BLOCKED') {
                    return res.status(403).json({ success: false, message: 'Your account has been blocked. Please contact support.' });
                }

                const token = generateToken(user.id, user.role);

                res.status(200).json({
                    success: true,
                    message: 'Login successful.',
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        phone: user.phone,
                        role: user.role,
                        name: user.full_name,
                        profile_pic: user.profile_pic,
                        status: user.status,
                        referred_by: user.referred_by
                    },
                });
            } else {
                res.status(401).json({ success: false, message: 'Invalid email or password.' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
};
