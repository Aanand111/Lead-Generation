const { pool } = require('../config/db');
const logger = require('../utils/logger');
const notificationsService = require('../modules/notifications/notifications.service');
const { broadcast } = require('../utils/socket');
const BulkProcessor = require('../utils/bulkJobProcessor');

const BATCH_SIZE = Number.parseInt(process.env.NOTIFICATION_BATCH_SIZE || '250', 10);

class NotificationService {
    static async sendPushToUser(userPhone, title, body, data = {}) {
        try {
            const { rows } = await pool.query('SELECT id FROM users WHERE phone = $1', [userPhone]);
            if (rows.length === 0) {
                return { success: false, message: 'User not found' };
            }

            return this.sendPushToUserId(rows[0].id, title, body, data);
        } catch (error) {
            logger.error('[NOTIFICATION] Failed to resolve user by phone', {
                phone: userPhone,
                message: error.message
            });
            return { success: false, error: error.message };
        }
    }

    static async sendGlobalNotification(title, body, metadata = {}) {
        try {
            broadcast('global_notification', {
                title,
                body,
                message: body,
                timestamp: new Date().toISOString(),
                ...metadata
            });
            logger.info('[NOTIFICATION] Global broadcast emitted', { title });
            return { success: true };
        } catch (error) {
            logger.error('[NOTIFICATION] Global broadcast failed', {
                title,
                message: error.message
            });
            return { success: false, error: error.message };
        }
    }

    static async sendPushToUserId(userId, title, body, data = {}) {
        try {
            await notificationsService.sendPushToUserId(userId, title, body, data);
            return { success: true };
        } catch (error) {
            logger.error('[NOTIFICATION] User push failed', {
                userId,
                message: error.message
            });
            return { success: false, error: error.message };
        }
    }

    static async sendBulkPush(userIds, title, body, data = {}) {
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return 0;
        }

        let successCount = 0;

        for (let start = 0; start < userIds.length; start += BATCH_SIZE) {
            const batch = userIds.slice(start, start + BATCH_SIZE);
            const results = await Promise.allSettled(
                batch.map((userId) => this.sendPushToUserId(userId, title, body, data))
            );

            successCount += results.filter(
                (result) => result.status === 'fulfilled' && result.value?.success
            ).length;
        }

        return successCount;
    }

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
            logger.error('[NOTIFICATION] Broadcast to all users failed', {
                title,
                message: error.message
            });
            return { success: false, error: error.message };
        }
    }

    static async sendPushToRole(role, title, body, data = {}) {
        let sentCount = 0;

        await BulkProcessor.processUsersInBatches({
            batchSize: BATCH_SIZE,
            role,
            useBatchHandler: true,
            handler: async (rows) => {
                const batchCount = await this.sendBulkPush(
                    rows.map((row) => row.id),
                    title,
                    body,
                    data
                );
                sentCount += batchCount;
            }
        });

        return sentCount;
    }
}

module.exports = NotificationService;
