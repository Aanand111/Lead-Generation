const adminFeedbackModel = require('../models/adminFeedbackModel');

const fetchFeedback = async (req, res, next) => {
    try {
        const feedback = await adminFeedbackModel.getAllFeedback();
        res.status(200).json({ success: true, data: feedback });
    } catch (error) {
        next(error);
    }
};

const resolveFeedback = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

        const updated = await adminFeedbackModel.updateFeedbackStatus(id, status, adminNotes);

        if (!updated) return res.status(404).json({ success: false, message: 'Feedback not found' });

        res.status(200).json({ success: true, message: 'Feedback status updated', data: updated });
    } catch (error) {
        next(error);
    }
};

const getVendorPerformance = async (req, res, next) => {
    try {
        const { pool } = require('../config/db');
        const result = await pool.query(`
            SELECT id, full_name as name, phone, vendor_rating as rating, reports_count as reports
            FROM users 
            WHERE role = 'vendor' 
            ORDER BY reports_count DESC
        `);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    fetchFeedback,
    resolveFeedback,
    getVendorPerformance
};
