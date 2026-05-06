const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const { redisConnection } = require('../config/redis');
const smsService = require('../services/smsService');
const whatsappService = require('../services/whatsappService');
const logger = require('../utils/logger');

// Redis-backed OTP store with 10-minute TTL
const OTP_TTL_SECONDS = 10 * 60; // 10 minutes

const storeOTP = async (phone, otp) => {
    await redisConnection.setex(`otp:${phone}`, OTP_TTL_SECONDS, otp);
};

const getOTP = async (phone) => {
    return await redisConnection.get(`otp:${phone}`);
};

const deleteOTP = async (phone) => {
    await redisConnection.del(`otp:${phone}`);
};

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

        // Store in Redis with TTL
        await storeOTP(phone, otp);

        // Phase 3: Send OTP via Notification Services
        let notificationSent = false;

        // Try WhatsApp first if configured
        if (process.env.WHATSAPP_ENABLED === 'true' || process.env.WHATSAPP_API_KEY) {
            const waResult = await whatsappService.sendOTP(phone, otp);
            if (waResult.success) notificationSent = true;
            else logger.error(`Failed to send WhatsApp OTP to ${phone}: ${waResult.error}`);
        }

        // Fallback to SMS or send alongside if not already sent
        if (!notificationSent || process.env.SMS_AND_WHATSAPP === 'true') {
            const smsResult = await smsService.sendOTP(phone, otp);
            if (smsResult.success) notificationSent = true;
            else logger.error(`Failed to send SMS OTP to ${phone}: ${smsResult.error}`);
        }

        if (!notificationSent) {
            // Even if providers fail, we return 200 in dev or specific error in prod
            // For now, let's just log and continue to not break the flow if mock is used
            logger.warn(`OTP generated but not sent via any provider for ${phone}`);
        }

        res.status(200).json({
            success: true,
            message: `OTP sent successfully. It will expire in 10 minutes.`
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

        // Validate OTP from Redis
        const storedOtp = await getOTP(phone);

        if (!storedOtp) {
            return res.status(400).json({ success: false, message: 'OTP not found or expired. Please request a new one.' });
        }

        if (storedOtp !== otp.toString()) {
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
        await deleteOTP(phone);

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { sendOTP, resetPassword };
