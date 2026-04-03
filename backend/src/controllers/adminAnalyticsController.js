const adminAnalyticsModel = require('../models/adminAnalyticsModel');

const fetchGranularAnalytics = async (req, res, next) => {
    try {
        const [
            vendorProductivity, 
            feedbackTrends, 
            bannerPerformance, 
            subscriptionStats,
            leadLifecycle
        ] = await Promise.all([
            adminAnalyticsModel.getVendorProductivity(),
            adminAnalyticsModel.getFeedbackTrends(),
            adminAnalyticsModel.getBannerPerformance(),
            adminAnalyticsModel.getSubscriptionAnalytics(),
            adminAnalyticsModel.getLeadLifecycleAnalytics()
        ]);

        res.status(200).json({ 
            success: true, 
            data: {
                vendorProductivity,
                feedbackTrends,
                bannerPerformance,
                subscriptionStats,
                leadLifecycle
            } 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Endpoint for recording impressions and clicks for Banner Analytics.
 */
const recordBannerInteraction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { type } = req.query; // 'view' or 'click'
        const { pool } = require('../config/db');

        if (type === 'click') {
            await pool.query('UPDATE banners SET clicks = clicks + 1 WHERE id = $1', [id]);
        } else {
            await pool.query('UPDATE banners SET views = views + 1 WHERE id = $1', [id]);
        }

        res.status(200).json({ success: true, message: 'Interaction recorded.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    fetchGranularAnalytics,
    recordBannerInteraction
};
