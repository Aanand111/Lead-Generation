const { pool } = require('../../config/db');

class NotificationsRepository {
    async create(notificationData) {
        const { user_id, title, body, type, data } = notificationData;
        const result = await pool.query(
            `INSERT INTO notifications (user_id, title, body, type, data) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [user_id, title, body, type || 'GENERAL', data ? JSON.stringify(data) : null]
        );
        return result.rows[0];
    }

    async findByUserId(userId, limit = 20, offset = 0) {
        const result = await pool.query(
            `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );
        return result.rows;
    }

    async markAsRead(notificationId, userId) {
        await pool.query(
            `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
            [notificationId, userId]
        );
    }

    async markAllAsRead(userId) {
        await pool.query(
            `UPDATE notifications SET is_read = true WHERE user_id = $1`,
            [userId]
        );
    }

    async getUnreadCount(userId) {
        const result = await pool.query(
            `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
            [userId]
        );
        return parseInt(result.rows[0].count);
    }
}

module.exports = new NotificationsRepository();
