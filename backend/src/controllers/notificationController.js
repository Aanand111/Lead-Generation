const { pool } = require('../config/db');

/**
 * Update FCM Token for the authenticated user
 */
const updateFcmToken = async (req, res, next) => {
    try {
        const { fcm_token } = req.body;
        const userId = req.user.id;

        if (!fcm_token) {
            return res.status(400).json({ success: false, message: 'FCM Token is required' });
        }

        const query = 'UPDATE users SET fcm_token = $1, updated_at = NOW() WHERE id = $2 RETURNING id';
        const result = await pool.query(query, [fcm_token, userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'FCM token updated successfully' });
    } catch (error) {
        console.error('[TOKEN UPDATE ERROR]', error.message);
        next(error);
    }
};

module.exports = {
    updateFcmToken
};
