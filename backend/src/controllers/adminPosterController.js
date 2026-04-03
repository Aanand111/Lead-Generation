const adminPosterModel = require('../models/adminPosterModel');

const addPoster = async (req, res, next) => {
    try {
        const { title, category_id, language, is_premium, status, layout_config, duration_days } = req.body;

        let thumbnail = null;
        if (req.file) {
            thumbnail = req.file.path;
        }

        if (isNaN(parseInt(category_id))) {
            return res.status(400).json({ success: false, message: 'Invalid Category ID. Please select a valid category.' });
        }

        const isPremiumBool = is_premium === 'true' || is_premium === true;
        
        let parsedLayout = layout_config;
        if (typeof layout_config === 'string') {
            try {
                parsedLayout = JSON.parse(layout_config);
            } catch (e) {
                parsedLayout = null; 
            }
        }

        const newPoster = await adminPosterModel.createPoster(
            title,
            thumbnail,
            category_id,
            language || 'English',
            isPremiumBool,
            status || 'Published',
            parsedLayout,
            duration_days
        );

        res.status(201).json({ success: true, message: 'Poster added successfully', data: newPoster });
    } catch (error) {
        next(error);
    }
};

const getPosters = async (req, res, next) => {
    try {
        const posters = await adminPosterModel.getPosters();
        res.status(200).json({ success: true, data: posters });
    } catch (error) {
        next(error);
    }
};

const editPoster = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, category_id, language, is_premium, status, layout_config, duration_days } = req.body;

        let thumbnail = null;
        if (req.file) {
            thumbnail = req.file.path;
        }

        if (isNaN(parseInt(category_id))) {
            return res.status(400).json({ success: false, message: 'Invalid Category ID. Please select a valid category.' });
        }

        const isPremiumBool = is_premium === 'true' || is_premium === true;
        
        let parsedLayout = layout_config;
        if (typeof layout_config === 'string') {
            try {
                parsedLayout = JSON.parse(layout_config);
            } catch (e) {
                parsedLayout = null;
            }
        }

        const updatedPoster = await adminPosterModel.updatePoster(
            id,
            title,
            thumbnail,
            category_id,
            language || 'English',
            isPremiumBool,
            status || 'Published',
            parsedLayout,
            duration_days
        );

        if (!updatedPoster) {
            return res.status(404).json({ success: false, message: 'Poster not found' });
        }
        res.status(200).json({ success: true, message: 'Poster updated successfully', data: updatedPoster });
    } catch (error) {
        next(error);
    }
};

const removePoster = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await adminPosterModel.deletePoster(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Poster not found' });
        }
        res.status(200).json({ success: true, message: 'Poster deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addPoster,
    getPosters,
    editPoster,
    removePoster
};
