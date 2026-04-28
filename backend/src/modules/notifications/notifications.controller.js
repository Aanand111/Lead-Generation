const notificationsService = require('./notifications.service');

class NotificationsController {
    async getMyNotifications(req, res, next) {
        try {
            const data = await notificationsService.getUserNotifications(req.user.id, req.query);
            res.status(200).json({ success: true, ...data });
        } catch (error) {
            next(error);
        }
    }

    async markAsRead(req, res, next) {
        try {
            const { id } = req.params;
            await notificationsService.markRead(req.user.id, id);
            res.status(200).json({ success: true, message: 'Marked as read' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new NotificationsController();
