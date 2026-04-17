const { getIO, sendToUser, broadcast } = require('../utils/socket');

class NotificationService {
    /**
     * sendPushToUser: Sends an individual notification by phone
     * Note: For WebSockets, we prefer using userId for better accuracy.
     * This method is kept for backward compatibility but will try to find userId if possible.
     */
    static async sendPushToUser(userPhone, title, body, data = {}) {
        // Since we can't easily map phone to socket without a DB lookup, 
        // we'll use the pool to find the userId first.
        const { pool } = require('../config/db');
        try {
            const { rows } = await pool.query('SELECT id FROM users WHERE phone = $1', [userPhone]);
            if (rows.length > 0) {
                return this.sendPushToUserId(rows[0].id, title, body, data);
            }
            return { success: false, message: 'User not found' };
        } catch (error) {
            console.error('[SOCKET NOTIFY ERROR]', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * sendPushToUserId: Sends an individual notification by userId via Socket.io
     */
    /**
     * sendGlobalNotification: Hits every SINGLE connected user in < 1 second. (True Realtime)
     * Use this for breaking news or global alerts.
     */
    static async sendGlobalNotification(title, body, metadata = {}) {
        try {
            const io = require('../utils/socket').getIO();
            if (io) {
                // This single line reaches 1M connected sockets efficiently!
                io.emit('global_notification', {
                    title,
                    body,
                    timestamp: new Date(),
                    ...metadata
                });
                console.log(`[REALTIME] Global broadcast emitted for: ${title}`);
                return { success: true };
            }
            return { success: false, message: 'Socket.io not initialized' };
        } catch (error) {
            console.error('[BROADCAST ERROR]', error.message);
            return { success: false, error: error.message };
        }
    }

    static async sendPushToUserId(userId, title, body, data = {}) {
        try {
            sendToUser(userId, 'notification', {
                title,
                body,
                ...data,
                timestamp: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            console.error('[SOCKET ERROR]', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * sendBulkPush: Sends a message to a list of user IDs
     */
    static async sendBulkPush(userIds, title, body, data = {}) {
        if (!userIds || userIds.length === 0) return 0;
        let successCount = 0;
        userIds.forEach(userId => {
            sendToUser(userId, 'notification', {
                title,
                body,
                ...data,
                timestamp: new Date().toISOString()
            });
            successCount++;
        });
        return successCount;
    }

    /**
     * sendPushToAllUsers: Broadcast to everyone online
     */
    static async sendPushToAllUsers(title, body, data = {}) {
        try {
            broadcast('notification', {
                title,
                body,
                ...data,
                timestamp: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            console.error('[ALL SOCKET ERROR]', error.message);
            return { success: false };
        }
    }
}

module.exports = NotificationService;
