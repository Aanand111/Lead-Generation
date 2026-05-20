const { pool } = require('../config/db');
const NotificationService = require('../services/notificationService');
const bcrypt = require('bcryptjs');
const { broadcast, sendToUser } = require('../utils/socket');

const getVendorStats = async (req, res, next) => {
    try {
        const vendorId = req.user.id; // User must be a vendor

        const statsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM users WHERE referred_by = $1 AND role = 'user') as total_users,
                (SELECT COUNT(*) FROM users WHERE referred_by = $1 AND role = 'vendor') as referred_vendors,
                (SELECT COALESCE(SUM(amount), 0) FROM commission_transactions WHERE vendor_id = $1 AND status = 'COMPLETED') as total_earnings,
                (SELECT COALESCE(SUM(amount), 0) FROM commission_transactions WHERE vendor_id = $1 AND status IN ('PENDING', 'REQUESTED')) as pending_earnings,
                (SELECT COALESCE(SUM(amount), 0) FROM commission_transactions WHERE vendor_id = $1 AND status = 'REQUESTED') as active_request_amount,
                (SELECT referral_code FROM users WHERE id = $1) as referral_code,
                (SELECT wallet_balance FROM users WHERE id = $1) as wallet_balance,
                (SELECT referred_by FROM users WHERE id = $1) as parentId,
                (SELECT p.full_name FROM users u JOIN users p ON u.referred_by = p.id WHERE u.id = $1) as parentName
        `;

        const result = await pool.query(statsQuery, [vendorId]);
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

const getVendorReferrals = async (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
        const offset = (page - 1) * limit;

        const queryStr = `
            WITH paged_referrals AS (
                SELECT
                    u.id,
                    u.phone,
                    CASE
                        WHEN u.full_name IS NOT NULL AND u.full_name != u.phone THEN u.full_name
                        ELSE COALESCE(u.full_name, 'Sub-Vendor')
                    END AS full_name,
                    u.role,
                    u.status,
                    u.created_at,
                    u.last_login
                FROM users u
                WHERE u.referred_by = $1
                ORDER BY u.created_at DESC
                LIMIT $2 OFFSET $3
            ),
            transaction_summary AS (
                SELECT
                    t.user_id,
                    MAX(t.created_at) AS last_purchase_at,
                    COALESCE(SUM(t.amount), 0) AS total_revenue
                FROM transactions t
                JOIN paged_referrals pr ON pr.id = t.user_id
                WHERE t.type IN ('PURCHASE', 'PLAN_PURCHASE')
                GROUP BY t.user_id
            ),
            child_summary AS (
                SELECT
                    u.referred_by AS referral_id,
                    MAX(u.created_at) AS last_child_at,
                    COUNT(*)::int AS child_count
                FROM users u
                JOIN paged_referrals pr ON pr.id = u.referred_by
                GROUP BY u.referred_by
            )
            SELECT
                pr.id,
                pr.phone,
                pr.full_name,
                pr.role,
                pr.status,
                pr.created_at,
                pr.last_login,
                COALESCE(
                    GREATEST(pr.last_login, ts.last_purchase_at, cs.last_child_at),
                    pr.last_login,
                    ts.last_purchase_at,
                    cs.last_child_at,
                    pr.created_at
                ) AS last_activity,
                COALESCE(ts.total_revenue, 0) AS total_revenue,
                COALESCE(cs.child_count, 0) AS child_referrals
            FROM paged_referrals pr
            LEFT JOIN transaction_summary ts ON ts.user_id = pr.id
            LEFT JOIN child_summary cs ON cs.referral_id = pr.id
            ORDER BY pr.created_at DESC
        `;
        const result = await pool.query(queryStr, [vendorId, limit, offset]);

        const countQuery = `SELECT COUNT(*) FROM users WHERE referred_by = $1`;
        const countRes = await pool.query(countQuery, [vendorId]);

        res.status(200).json({
            success: true,
            data: result.rows,
            pagination: {
                total: parseInt(countRes.rows[0].count),
                page,
                limit,
                pages: Math.ceil(parseInt(countRes.rows[0].count, 10) / limit),
            }
        });
    } catch (error) {
        next(error);
    }
};

const getVendorEarnings = async (req, res, next) => {
    try {
        const vendorId = req.user.id;

        // Pagination params — default: page 1, 15 records per page
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 15));
        const offset = (page - 1) * limit;

        // Optional status filter (PENDING | REQUESTED | COMPLETED | FAILED)
        const status = req.query.status ? req.query.status.toUpperCase() : null;

        const params = [vendorId];
        let whereClause = 'WHERE vendor_id = $1';

        if (status) {
            params.push(status);
            whereClause += ` AND status = $${params.length}`;
        }

        // Paginated data query
        const dataQuery = `
            SELECT id, vendor_id, amount, status, remarks, type, created_at
            FROM commission_transactions
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;
        const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

        // Total count for pagination controls
        const countQuery = `
            SELECT COUNT(*) FROM commission_transactions ${whereClause}
        `;
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count, 10);

        res.status(200).json({
            success: true,
            data: dataResult.rows,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

const referUser = async (req, res, next) => {
    // This will likely be handled by a user-facing signup using a referral code.
    // However, if a vendor can add them manually:
    const client = await pool.connect();
    try {
        const vendorId = req.user.id;
        const { phone, email, password, pincode, city, state } = req.body;
        const full_name = req.body.full_name || req.body.name || `User_${phone?.slice(-4) || 'Node'}`;

        if (!email) return res.status(400).json({ success: false, message: 'Email is required for user registration.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newReferralCode = `USR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        await client.query('BEGIN');

        const result = await client.query(
            'INSERT INTO users (phone, email, password_hash, full_name, role, referred_by, referral_code) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [phone, email, hashedPassword, full_name, 'user', vendorId, newReferralCode]
        );

        const newUser = result.rows[0];

        // Synchronize with 'user_profiles'
        if (pincode || city || state) {
            await client.query(
                'INSERT INTO user_profiles (user_id, pincode, city, state) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET pincode = EXCLUDED.pincode, city = EXCLUDED.city, state = EXCLUDED.state',
                [newUser.id, pincode, city, state]
            );
        }

        await client.query('COMMIT');

        res.status(201).json({ success: true, message: 'User referred & added successfully', data: newUser });

        // Notify Admin
        NotificationService.notifyAdmins('New User Added', `Vendor ${req.user.full_name || 'Node'} added a new user: ${full_name}`, {
            userId: newUser.id,
            referrerId: vendorId
        }).catch(err => console.error('[ADMIN_NOTIFY_ERROR]', err.message));
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
};

const referVendor = async (req, res, next) => {
    const client = await pool.connect();
    try {
        const vendorId = req.user.id;
        const { phone, email, password, pincode, city, state } = req.body;
        const full_name = req.body.full_name || req.body.name || `Vendor_${phone?.slice(-4) || 'Node'}`;

        if (!email) return res.status(400).json({ success: false, message: 'Email is required for sub-vendor registration.' });
        if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required.' });

        const checkVendor = await client.query('SELECT referred_by, status, full_name, phone FROM users WHERE id = $1', [vendorId]);
        const vendor = checkVendor.rows[0];

        if (!vendor || vendor.status !== 'ACTIVE') {
            return res.status(403).json({ success: false, message: 'Unauthorized: Your account is inactive or you do not have permission.' });
        }

        if (vendor.referred_by) {
            return res.status(403).json({ message: 'Access Denied: Only primary vendors can refer other vendors.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newReferralCode = `VND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        await client.query('BEGIN');

        const result = await client.query(
            'INSERT INTO users (phone, email, password_hash, full_name, role, referred_by, referral_code, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [phone, email, hashedPassword, full_name, 'vendor', vendorId, newReferralCode, 'ACTIVE']
        );

        const newUser = result.rows[0];

        if (pincode || city || state) {
            await client.query(
                'INSERT INTO user_profiles (user_id, pincode, city, state) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET pincode = EXCLUDED.pincode, city = EXCLUDED.city, state = EXCLUDED.state',
                [newUser.id, pincode, city, state]
            );
        }

        await client.query('COMMIT');

        try {
            broadcast('new_vendor_referral', {
                message: `New Sub-Vendor Added: ${full_name}`,
                phone: phone,
                referrer: req.user.full_name || 'Primary Node',
                timestamp: new Date()
            });
        } catch (sErr) {}

        NotificationService.notifyAdmins('New Sub-Vendor Registered', `${full_name} was registered by ${req.user.full_name || 'Primary Node'}.`, {
            userId: newUser.id,
            referrerId: vendorId,
            role: 'vendor'
        }).catch(err => {});

        res.status(201).json({
            success: true,
            message: 'Sub-Vendor registered successfully.',
            data: { id: result.rows[0].id, phone: result.rows[0].phone, email: result.rows[0].email, referral_code: newReferralCode }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        if (error.code === '23505') {
            return res.status(400).json({ success: false, message: 'Identity Conflict: Phone number or Referral code already exists.' });
        }
        next(error);
    } finally {
        client.release();
    }
};

const requestSettlement = async (req, res, next) => {
    const client = await pool.connect();
    let transactionOpen = false;

    try {
        const vendorId = req.user.id;

        let amount = 0;
        let vendorName = 'A Vendor';
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
        `, [vendorId]);

        const rowCount = parseInt(result.rows[0].updated_count, 10);

        if (rowCount === 0) {
            const existingRequestRes = await client.query(
                "SELECT COALESCE(SUM(amount), 0)::numeric AS total_amount FROM commission_transactions WHERE vendor_id = $1 AND status = 'REQUESTED'",
                [vendorId]
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
                COALESCE(MAX(CASE WHEN id = $1 THEN full_name END), 'A Vendor') AS vendor_name,
                ARRAY(SELECT id::text FROM users WHERE role = 'admin') AS admin_ids
            FROM users
            WHERE id = $1 OR role = 'admin'
        `, [vendorId]);

        vendorName = metadataRes.rows[0]?.vendor_name || vendorName;
        adminIds = metadataRes.rows[0]?.admin_ids || [];

        await client.query('COMMIT');
        transactionOpen = false;

        // Add socket notification exclusively to Admins
        try {

            for (const adminId of adminIds) {
                // To show Bell Icon Notification Dropdown
                sendToUser(adminId, 'notification', {
                    title: 'Commission Request',
                    body: `${vendorName} requested ₹${amount.toFixed(2)}.`
                });

                // To show Toast Notification
                sendToUser(adminId, 'admin_notification', {
                    title: 'New Commission Request',
                    body: `${vendorName} has requested a withdrawal of ₹${amount.toFixed(2)}.`
                });
            }
        } catch (sErr) {
            console.error('[SOCKET_ERROR] Failed to emit commission request notification:', sErr.message);
        }

        res.status(200).json({
            success: true,
            message: 'Payout request submitted successfully. Our team will review it shortly.'
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

const getPendingSubVendors = async (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const query = `
            SELECT id, email, phone, full_name, status, created_at 
            FROM users 
            WHERE referred_by = $1 AND role = 'vendor' AND status = 'PENDING'
            ORDER BY created_at DESC
        `;
        const result = await pool.query(query, [vendorId]);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
};

const approveSubVendor = async (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const { subVendorId } = req.params;
        const { action } = req.body; // 'APPROVE' or 'REJECT'

        if (!['APPROVE', 'REJECT'].includes(action)) {
            return res.status(400).json({ success: false, message: 'Invalid action. Use APPROVE or REJECT.' });
        }

        const newStatus = action === 'APPROVE' ? 'ACTIVE' : 'REJECTED';

        const result = await pool.query(
            "UPDATE users SET status = $1 WHERE id = $2 AND referred_by = $3 RETURNING *",
            [newStatus, subVendorId, vendorId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Referral request not found or unauthorized.' });
        }

        const approvedUser = result.rows[0];

        // Legacy vendors table sync removed as part of the dual table architecture refactor.

        res.status(200).json({
            success: true,
            message: `${approvedUser.role === 'vendor' ? 'Sub-vendor' : 'User'} ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully.`,
            data: {
                id: approvedUser.id,
                full_name: approvedUser.full_name,
                status: approvedUser.status
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getVendorStats,
    getVendorReferrals,
    getVendorEarnings,
    referUser,
    referVendor,
    requestSettlement,
    getPendingSubVendors,
    approveSubVendor
};
