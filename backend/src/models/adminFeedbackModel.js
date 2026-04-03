const { pool } = require('../config/db');

/**
 * Fetch all user feedback with details about lead and vendor.
 */
const getAllFeedback = async () => {
    const query = `
        SELECT 
            f.*, 
            u.full_name as user_name, 
            v.full_name as vendor_name, 
            l.customer_name as lead_name,
            l.lead_id as lead_uid
        FROM lead_feedback f
        JOIN users u ON f.user_id = u.id
        LEFT JOIN leads l ON f.lead_id = l.id
        LEFT JOIN users v ON f.vendor_id = v.id
        ORDER BY f.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

/**
 * Update the status of feedback and update vendor metrics if needed.
 */
const updateFeedbackStatus = async (id, status, adminNotes) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const result = await client.query(
            'UPDATE lead_feedback SET status = $1, admin_notes = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            [status, adminNotes, id]
        );
        
        if (result.rows.length === 0) return null;
        
        const feedback = result.rows[0];
        
        // If feedback is marked as RESOLVED/REJECTED, we may update vendor analytics here
        if (status === 'RESOLVED' && feedback.vendor_id) {
            // Update average rating and reports count
            await client.query(`
                UPDATE users u
                SET 
                    vendor_rating = (SELECT AVG(rating) FROM lead_feedback WHERE vendor_id = $1 AND status = 'RESOLVED'),
                    reports_count = (SELECT COUNT(*) FROM lead_feedback WHERE vendor_id = $1 AND rating <= 2)
                WHERE id = $1
            `, [feedback.vendor_id]);
        }
        
        await client.query('COMMIT');
        return feedback;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    getAllFeedback,
    updateFeedbackStatus
};
