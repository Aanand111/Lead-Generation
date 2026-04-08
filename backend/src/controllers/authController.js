const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { findUserByPhone, findUserByEmail, createUser, findUserByReferralCode, findUserByIdentifier } = require('../models/userModel');

// --- Helper functions ---
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secretkey123', {
        expiresIn: '7d',
    });
};

const registerUser = async (req, res, next) => {
    try {
        const { phone, password, role, referral_code, name } = req.body;
        const email = req.body.email?.trim().toLowerCase();

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
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create user with status check
        let generatedReferralCode = null;
        if (role === 'vendor') {
            const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
            generatedReferralCode = `VND-${randomStr}`;
        }

        const user = await createUser({
            phone,
            email,
            password_hash,
            role,
            full_name: name,
            referral_code: generatedReferralCode,
            referred_by: referredById,
            status: role === 'vendor' ? 'PENDING' : 'ACTIVE' // Vendors need approval
        });

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
            return res.status(400).json({ success: false, message: 'Missing email or password payload.' });
        }

        const user = await findUserByIdentifier(email.trim().toLowerCase());

        if (user) {
            const isMatch = await bcrypt.compare(password, user.password_hash);

            if (isMatch) {
                if (user.status === 'PENDING') {
                    return res.status(403).json({ success: false, message: 'Your account is pending hierarchy approval.' });
                }
                if (user.status === 'BLOCKED') {
                    return res.status(403).json({ success: false, message: 'This node has been decommissioned by the admin.' });
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
                        status: user.status
                    },
                });
            } else {
                res.status(401).json({ success: false, message: 'Identity verification failed.' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Identity verification failed.' });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
};
