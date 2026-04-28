const userService = require('./user.service');
const logger = require('../../utils/logger');

class UserController {
    async getDashboardStats(req, res, next) {
        try {
            const data = await userService.getDashboardStats(req.user.id);
            res.status(200).json({ success: true, data });
        } catch (error) {
            logger.error('[USER] Dashboard stats failed', {
                message: error.message,
                stack: error.stack
            });
            next(error);
        }
    }

    async getMyLeads(req, res, next) {
        try {
            const data = await userService.getMyLeads(req.user.id);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req, res, next) {
        try {
            const data = await userService.getProfile(req.user.id);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req, res, next) {
        try {
            await userService.updateProfile(req.user.id, req.body);
            res.status(200).json({ success: true, message: 'Profile updated successfully.' });
        } catch (error) {
            next(error);
        }
    }

    async getReferralStats(req, res, next) {
        try {
            const data = await userService.getReferralStats(req.user.id);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    async getNews(req, res, next) {
        try {
            const data = await userService.getNews();
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    async getBanners(req, res, next) {
        try {
            const data = await userService.getBanners();
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    async getPosters(req, res, next) {
        try {
            const payload = await userService.getPosters(req.user.id);
            res.status(200).json({ success: true, ...payload });
        } catch (error) {
            next(error);
        }
    }

    async getPosterTemplates(req, res, next) {
        try {
            const data = await userService.getPosterTemplates(req.query.category_id);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    async generatePoster(req, res, next) {
        try {
            const result = await userService.generatePoster(req.user.id, req.body, req.files);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async submitLeadFeedback(req, res, next) {
        try {
            const data = await userService.submitLeadFeedback(req.user.id, req.body);
            res.status(201).json({
                success: true,
                message: 'Feedback submitted successfully',
                data
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
