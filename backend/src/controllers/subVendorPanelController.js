const { pool } = require('../config/db');

/**
 * Get Sub-Vendor Dashboard Statistics
 */
const getSubVendorStats = async (req, res, next) => {
    try {
        const subVendorId = req.user.id;

        // Total referred users
        const referredUsers = await pool.query(
            "SELECT COUNT(*) FROM users WHERE referred_by = $1 AND role = 'user'",
            [subVendorId]
        );

        // Earnings from users table directly
        const wallet = await pool.query(
            "SELECT wallet_balance as balance FROM users WHERE id = $1",
            [subVendorId]
        );

        // Leads injected by this sub-vendor
        const leadsAdded = await pool.query(
            "SELECT COUNT(*) FROM leads WHERE created_by = $1",
            [subVendorId]
        );

        // Get Referral Code and Parent Info for the sub-vendor themselves
        const userRes = await pool.query(`
            SELECT u.referral_code, u.referred_by, p.full_name as parent_name
            FROM users u
            LEFT JOIN users p ON u.referred_by = p.id
            WHERE u.id = $1
        `, [subVendorId]);
        const userData = userRes.rows[0];

        res.status(200).json({
            success: true,
            stats: {
                totalReferrals: parseInt(referredUsers.rows[0].count),
                walletBalance: wallet.rows[0]?.balance || 0,
                totalLeadsInjected: parseInt(leadsAdded.rows[0].count),
                referralCode: userData?.referral_code || 'N/A',
                parentId: userData?.referred_by || 'ORGANIC',
                parentName: userData?.parent_name || (userData?.referred_by ? 'System Node' : 'ORGANIC')
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Sub-Vendor Referral Network
 */
const getSubVendorReferrals = async (req, res, next) => {
    try {
        const subVendorId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const referrals = await pool.query(
            `SELECT full_name, email, phone, status, created_at 
             FROM users 
             WHERE referred_by = $1 AND role = 'user'
             ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
            [subVendorId, limit, offset]
        );

        res.status(200).json({
            success: true,
            data: referrals.rows,
            pagination: { page, limit }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Earnings History
 */
const getSubVendorEarnings = async (req, res, next) => {
    try {
        const subVendorId = req.user.id;
        
        const earnings = await pool.query(
            `SELECT t.amount, t.type, t.status, t.remarks, t.created_at
             FROM transactions t
             WHERE t.user_id = $1
             ORDER BY t.created_at DESC LIMIT 50`,
            [subVendorId]
        );

        res.status(200).json({
            success: true,
            earnings: earnings.rows
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Request Commission Payout (Submit to Admin)
 */
const requestSettlement = async (req, res, next) => {
    const client = await pool.connect();
    let transactionOpen = false;

    try {
        const subVendorId = req.user.id;

        let amount = 0;
        let subVendorName = 'A Sub-Vendor';
        let adminIds = [];

        await client.query('BEGIN');
        transactionOpen = true;

        const result = await client.query(`
            WITH locked_rows AS (
                SELECT id, amount
                FROM commission_transactions
                WHERE vendor_id = $1 AND status = 'PENDING'
                FOR UPDATE
            ),
            updated_rows AS (
                UPDATE commission_transactions ct
                SET status = 'REQUESTED'
                FROM locked_rows lr
                WHERE ct.id = lr.id
                RETURNING lr.amount
            )
            SELECT COUNT(*)::int AS updated_count, COALESCE(SUM(amount), 0)::numeric AS total_amount
            FROM updated_rows
        `, [subVendorId]);

        const rowCount = parseInt(result.rows[0].updated_count, 10);

        if (rowCount === 0) {
            const existingRequestRes = await client.query(
                "SELECT COALESCE(SUM(amount), 0)::numeric AS total_amount FROM commission_transactions WHERE vendor_id = $1 AND status = 'REQUESTED'",
                [subVendorId]
            );
            const existingRequestedAmount = parseFloat(existingRequestRes.rows[0]?.total_amount || 0);

            await client.query('ROLLBACK');
            transactionOpen = false;

            if (existingRequestedAmount > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'A payout request is already pending review.',
                    requested_amount: existingRequestedAmount
                });
            }

            return res.status(400).json({
                success: false,
                message: 'You have no pending commissions to request at this time.'
            });
        }

        amount = parseFloat(result.rows[0].total_amount);

        const metadataRes = await client.query(`
            SELECT
                COALESCE(MAX(CASE WHEN id = $1 THEN full_name END), 'A Sub-Vendor') AS vendor_name,
                ARRAY(SELECT id::text FROM users WHERE role = 'admin') AS admin_ids
            FROM users
            WHERE id = $1 OR role = 'admin'
        `, [subVendorId]);

        subVendorName = metadataRes.rows[0]?.vendor_name || subVendorName;
        adminIds = metadataRes.rows[0]?.admin_ids || [];

        await client.query('COMMIT');
        transactionOpen = false;

        // Add socket notification exclusively to Admins
        try {
            const { sendToUser } = require('../utils/socket');
            
            for (const adminId of adminIds) {
                sendToUser(adminId, 'notification', {
                    title: 'Sub-Vendor Payout',
                    body: `${subVendorName} (Sub-Vendor) requested ₹${amount.toFixed(2)}.`
                });
            }
        } catch (sErr) {
            console.error('[SOCKET_ERROR] Failed to emit sub-vendor request notification:', sErr.message);
        }

        res.status(200).json({ 
            success: true, 
            message: 'Payout request submitted to administration successfully.' 
        });
    } catch (error) {
        if (transactionOpen) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackError) {}
        }
        next(error);
    } finally {
        client.release();
    }
};

/**
 * Approve or Reject a user referral
 */
const approveReferral = async (req, res, next) => {
    try {
        const subVendorId = req.user.id;
        const { referralId } = req.params;
        const { action } = req.body; // 'APPROVE' or 'REJECT'

        if (!['APPROVE', 'REJECT'].includes(action)) {
            return res.status(400).json({ success: false, message: 'Invalid action. Use APPROVE or REJECT.' });
        }

        const newStatus = action === 'APPROVE' ? 'ACTIVE' : 'REJECTED';

        const result = await pool.query(
            "UPDATE users SET status = $1 WHERE id = $2 AND referred_by = $3 AND role = 'user' RETURNING *",
            [newStatus, referralId, subVendorId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Referral request not found or unauthorized.' });
        }

        res.status(200).json({ 
            success: true, 
            message: `User ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully.`,
            data: {
                id: result.rows[0].id,
                status: result.rows[0].status
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSubVendorStats,
    getSubVendorReferrals,
    getSubVendorEarnings,
    requestSettlement,
    approveReferral
};
