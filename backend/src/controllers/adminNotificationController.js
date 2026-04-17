const NotificationService = require('../services/notificationService');
const { pool } = require('../config/db');

/**
 * Send targeted notification (By Roles or Specific Users)
 */
const sendTargetedNotification = async (req, res, next) => {
    try {
        const { title, body, targetType, targetIds, targetRole } = req.body;

        if (!title || !body) {
            return res.status(400).json({ success: false, message: 'Title and body are required' });
        }

        let sentCount = 0;

        if (targetType === 'ALL') {
            await NotificationService.sendPushToAllUsers(title, body);
            sentCount = 'ALL ONLINE';
        } else if (targetType === 'ROLE' && targetRole) {
            const users = await pool.query('SELECT id FROM users WHERE role = $1', [targetRole]);
            const ids = users.rows.map(u => u.id);
            sentCount = await NotificationService.sendBulkPush(ids, title, body);
        } else if (targetType === 'SPECIFIC' && targetIds) {
            sentCount = await NotificationService.sendBulkPush(targetIds, title, body);
        }

        // Optional: Save to a notifications_log table if exists
        // await pool.query('INSERT INTO notifications_log (title, body, target_type, sent_count) VALUES ($1, $2, $3, $4)', [title, body, targetType, sentCount]);

        res.status(200).json({ success: true, message: `Notification dispatched successfully to ${sentCount} users.` });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Notification Stats (Optional)
 */
const getNotificationHistory = async (req, res, next) => {
    try {
        // This is a mockup since we don't have a history table yet but can be added if PRD needs it
        res.status(200).json({ success: true, data: [] });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendTargetedNotification,
    getNotificationHistory
};
