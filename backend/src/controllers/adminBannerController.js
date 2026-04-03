const adminBannerDb = require('../models/adminBannerModel');

const addBanner = async (req, res, next) => {
    try {
        const { title, image, link, type, placement, start_date, end_date, is_active } = req.body;

        if (!title || !image) {
            return res.status(400).json({ success: false, message: 'Title and image are required' });
        }

        const newBanner = await adminBannerDb.createBanner({
            title, image, link, type, placement, start_date, end_date,
            is_active: is_active !== undefined ? is_active : true,
        });

        res.status(201).json({ success: true, message: 'Banner created successfully', data: newBanner });
    } catch (error) {
        next(error);
    }
};

const editBanner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, image, link, type, placement, start_date, end_date, is_active } = req.body;

        if (!title || !image) {
            return res.status(400).json({ success: false, message: 'Title and image are required' });
        }

        const updatedBanner = await adminBannerDb.updateBanner(id, {
            title, image, link, type, placement, start_date, end_date, is_active
        });

        if (!updatedBanner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        res.status(200).json({ success: true, message: 'Banner updated successfully', data: updatedBanner });
    } catch (error) {
        next(error);
    }
};

const getBanners = async (req, res, next) => {
    try {
        const activeOnly = req.query.activeOnly === 'true';
        const banners = await adminBannerDb.getAllBanners(activeOnly);

        res.status(200).json({ success: true, data: banners });
    } catch (error) {
        next(error);
    }
};

const removeBanner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const removed = await adminBannerDb.deleteBanner(id);

        if (!removed) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        res.status(200).json({ success: true, message: 'Banner deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const recordBannerClick = async (req, res, next) => {
    try {
        const { id } = req.params;
        const bannerClick = await adminBannerDb.trackBannerClick(id);

        if (!bannerClick) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        res.status(200).json({ success: true, message: 'Click tracked', currentClicks: bannerClick.clicks });
    } catch (error) {
        next(error);
    }
}


module.exports = {
    addBanner,
    editBanner,
    getBanners,
    removeBanner,
    recordBannerClick
};
