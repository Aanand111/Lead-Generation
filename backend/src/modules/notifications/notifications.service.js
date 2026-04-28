const notificationsRepository = require('./notifications.repository');
const { sendToUser, broadcast } = require('../../utils/socket');
const logger = require('../../utils/logger');

class NotificationsService {
    async sendPushToUserId(userId, title, body, data = {}) {
        try {
            const notification = await notificationsRepository.create({
                user_id: userId,
                title,
                body,
                type: data.type,
                data
            });

            // 2. Real-time push
            sendToUser(userId, 'notification', {
                id: notification.id,
                title,
                body,
                ...data,
                timestamp: notification.created_at
            });

            return notification;
        } catch (error) {
            logger.error('[NOTIFICATION] Failed to persist realtime user notification', {
                userId,
                message: error.message
            });
            throw error;
        }
    }

    async broadcast(title, body, data = {}) {
        try {
            broadcast('notification', {
                title,
                body,
                ...data,
                timestamp: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            logger.error('[NOTIFICATION] Broadcast failed', {
                title,
                message: error.message
            });
            throw error;
        }
    }

    async getUserNotifications(userId, query) {
        const limit = parseInt(query.limit) || 20;
        const offset = parseInt(query.offset) || 0;
        const notifications = await notificationsRepository.findByUserId(userId, limit, offset);
        const unreadCount = await notificationsRepository.getUnreadCount(userId);
        
        return { notifications, unreadCount };
    }

    async markRead(userId, notificationId) {
        if (notificationId === 'all') {
            await notificationsRepository.markAllAsRead(userId);
        } else {
            await notificationsRepository.markAsRead(notificationId, userId);
        }
    }
}

module.exports = new NotificationsService();
