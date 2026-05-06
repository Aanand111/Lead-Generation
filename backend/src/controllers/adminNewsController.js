const adminNewsModel = require('../models/adminNewsModel');

const addNews = async (req, res, next) => {
    try {
        const { title, content, category_id, publish_date, status, is_push_notification } = req.body;

        let image = null;
        if (req.file) {
            image = req.file.path;
        }

        if (!title || !category_id) {
            return res.status(400).json({ success: false, message: 'Title and category are required' });
        }

        const created_by = req.user ? req.user.id : null;
        const statusBool = status === 'true' || status === true || status === 'Publish';
        const pushNotify = is_push_notification === 'true' || is_push_notification === true;

        const newNews = await adminNewsModel.createNews(title, content, image, category_id, publish_date || null, statusBool, pushNotify, created_by);

        // If push notification is enabled, broadcast to all vendors
        if (pushNotify && statusBool) {
            const { pool } = require('../config/db');
            await pool.query(`
                INSERT INTO notifications (user_id, title, body, type, data)
                SELECT id, $1, $2, 'SYSTEM_NEWS', $3
                FROM users WHERE role = 'vendor' AND status = 'ACTIVE'
            `, [
                title,
                (content || '').substring(0, 100) + '...',
                `{"news_id": "${newNews.id}"}`
            ]);
        }

        res.status(201).json({ success: true, message: 'News added and broadcasted successfully', data: newNews });
    } catch (error) {
        next(error);
    }
};

const getNews = async (req, res, next) => {
    try {
        const news = await adminNewsModel.getNewsList();
        res.status(200).json({ success: true, data: news });
    } catch (error) {
        next(error);
    }
};

const editNews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, content, category_id, publish_date, status, is_push_notification } = req.body;

        let image = null;
        if (req.file) {
            image = req.file.path;
        }

        if (!title || !category_id) {
            return res.status(400).json({ success: false, message: 'Title and category are required' });
        }

        const statusBool = status === 'true' || status === true || status === 'Publish';
        const pushNotify = is_push_notification === 'true' || is_push_notification === true;

        const updatedNews = await adminNewsModel.updateNews(id, title, content, image, category_id, publish_date || null, statusBool, pushNotify);
        if (!updatedNews) {
            return res.status(404).json({ success: false, message: 'News not found' });
        }

        res.status(200).json({ success: true, message: 'News updated successfully', data: updatedNews });
    } catch (error) {
        next(error);
    }
};

const removeNews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await adminNewsModel.deleteNews(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'News not found' });
        }
        res.status(200).json({ success: true, message: 'News deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addNews,
    getNews,
    editNews,
    removeNews
};
