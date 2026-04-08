// In-memory OTP store: { phone: { otp, expiresAt } }
const otpStore = new Map();

const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

// POST /api/auth/forgot-password
// Body: { phone }
const sendOTP = async (req, res, next) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number is required.' });
        }

        // Check user exists
        const result = await pool.query(
            'SELECT id, full_name FROM users WHERE phone = $1',
            [phone]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No account found with this phone number.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        otpStore.set(phone, { otp, expiresAt });

        // Print OTP to backend console (visible in terminal/logs)
        console.log(`\n========================================`);
        console.log(`[OTP] Phone: ${phone}`);
        console.log(`[OTP] Code:  ${otp}`);
        console.log(`[OTP] Valid for 10 minutes`);
        console.log(`========================================\n`);

        res.status(200).json({
            success: true,
            message: `OTP generated. Check backend terminal for the code.`
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/reset-password
// Body: { phone, otp, newPassword }
const resetPassword = async (req, res, next) => {
    try {
        const { phone, otp, newPassword } = req.body;

        if (!phone || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: 'Phone, OTP, and new password are required.' });
        }

        // Validate OTP
        const stored = otpStore.get(phone);

        if (!stored) {
            return res.status(400).json({ success: false, message: 'OTP not found. Please request a new one.' });
        }

        if (Date.now() > stored.expiresAt) {
            otpStore.delete(phone);
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        if (stored.otp !== otp.toString()) {
            return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
        }

        // OTP valid — hash new password and update DB
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(newPassword, salt);

        const updateResult = await pool.query(
            'UPDATE users SET password_hash = $1 WHERE phone = $2 RETURNING id, full_name, phone',
            [password_hash, phone]
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Clear OTP after successful reset
        otpStore.delete(phone);

        console.log(`[PASSWORD RESET] Successful for phone: ${phone}`);

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { sendOTP, resetPassword };
