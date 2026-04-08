const { pool } = require('../config/db');

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
                (SELECT referral_code FROM users WHERE id = $1) as referral_code
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const queryStr = `
            SELECT 
                u.id, u.phone, u.full_name, u.role, u.status, u.created_at, u.last_login,
                (SELECT MAX(created_at) FROM transactions t WHERE t.user_id = u.id AND t.type IN ('PURCHASE', 'PLAN_PURCHASE')) as last_activity,
                (SELECT COALESCE(SUM(amount), 0) FROM transactions t WHERE t.user_id = u.id AND (t.type = 'PURCHASE' OR t.type = 'PLAN_PURCHASE')) as total_revenue
            FROM users u 
            WHERE u.referred_by = $1 
            ORDER BY u.created_at DESC 
            LIMIT $2 OFFSET $3
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
            }
        });
    } catch (error) {
        next(error);
    }
};

const getVendorEarnings = async (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const query = `
            SELECT * FROM commission_transactions 
            WHERE vendor_id = $1 
            ORDER BY created_at DESC
        `;
        const result = await pool.query(query, [vendorId]);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
};

const referUser = async (req, res, next) => {
    // This will likely be handled by a user-facing signup using a referral code.
    // However, if a vendor can add them manually:
    try {
        const vendorId = req.user.id;
        const { phone, email, password, full_name } = req.body;

        if (!email) return res.status(400).json({ success: false, message: 'Email sequence required for user enrollment.' });

        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await pool.query(
            'INSERT INTO users (phone, email, password_hash, full_name, role, referred_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [phone, email, hashedPassword, full_name, 'user', vendorId]
        );

        res.status(201).json({ success: true, message: 'User referred & added successfully', data: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

const referVendor = async (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const { phone, email, password, full_name } = req.body;

        if (!email) return res.status(400).json({ success: false, message: 'Email signal required for sub-vendor orchestration.' });

        // BRD Section 1.3: Secondary Vendor Restriction
        // Primary Vendors have referred_by = NULL (added by Admin).
        // Secondary/Sub-Vendors have referred_by = [Primary Vendor ID].
        const checkVendor = await pool.query('SELECT referred_by, status FROM users WHERE id = $1', [vendorId]);
        const vendor = checkVendor.rows[0];

        if (!vendor || vendor.status !== 'ACTIVE') {
            return res.status(403).json({ success: false, message: 'AUTHENTICATION_FAILURE: Vendor node is inactive or unauthorized.' });
        }

        if (vendor.referred_by) {
            console.warn(`[HIERARCHY_BLOCK] Sub-Vendor ${vendorId} attempted to add a 3rd-tier vendor.`);
            return res.status(403).json({ 
                success: false, 
                message: 'HIERARCHY_RESTRICTION: Only Primary/Direct vendors are authorized to orchestrate new vendor nodes.' 
            });
        }

        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate unique referral code for the new Sub-Vendor
        const newReferralCode = `VND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Get the current vendor's registry ID (from 'vendors' table) to maintain hierarchy
        let registryVendorId = null;
        try {
            const userRes = await pool.query('SELECT phone, email FROM users WHERE id = $1', [vendorId]);
            if (userRes.rows.length > 0) {
                const { phone: uPhone, email: uEmail } = userRes.rows[0];
                const vendorRes = await pool.query(
                    'SELECT id FROM vendors WHERE phone = $1 OR email = $2 LIMIT 1',
                    [uPhone, uEmail]
                );
                if (vendorRes.rows.length > 0) {
                    registryVendorId = vendorRes.rows[0].id;
                }
            }
        } catch (err) {
            console.error('[HIERARCHY_SYNC] Failed to resolve parent vendor node:', err.message);
        }

        // Synchronize with 'vendors' table for Admin visibility
        const vendorDb = require('../models/vendorModel');
        try {
            await vendorDb.createVendor({
                name: full_name,
                phone: phone,
                email: email,
                password: hashedPassword,
                referral_code: newReferralCode,
                referred_by_vendor_id: registryVendorId || vendorId, // Fallback to user ID if registry entry missing
                status: 'Active'
            });
        } catch (vErr) {
            console.error('[SYNC_ERROR] Failed to populate vendors table:', vErr.message);
        }

        // Synchronize with 'users' table for Authentication
        const result = await pool.query(
            'INSERT INTO users (phone, email, password_hash, full_name, role, referred_by, referral_code, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [phone, email, hashedPassword, full_name, 'vendor', vendorId, newReferralCode, 'ACTIVE']
        );

        // Emit real-time notification for Admin
        try {
            const { getIO } = require('../utils/socket');
            const io = getIO();
            io.emit('new_vendor_referral', {
                message: `New Vendor Node Initialized: ${full_name}`,
                phone: phone,
                referrer: req.user.full_name || 'Primary Node',
                timestamp: new Date()
            });
        } catch (sErr) {
            console.error('[SOCKET_ERROR] Failed to emit referral signal:', sErr.message);
        }

        res.status(201).json({ 
            success: true, 
            message: 'Sub-Vendor identity registered successfully in the hierarchy.', 
            data: { id: result.rows[0].id, phone: result.rows[0].phone, email: result.rows[0].email, referral_code: newReferralCode } 
        });
    } catch (error) {
        if (error.code === '23505') { // Unique constraint (phone/code)
             return res.status(400).json({ success: false, message: 'Identity Conflict: Smartphone signature or Referral code already exists in the mesh.' });
        }
        next(error);
    }
};

const requestSettlement = async (req, res, next) => {
    try {
        const vendorId = req.user.id;

        // Check if there are any pending commissions to request
        const checkPending = await pool.query(
            "SELECT COUNT(*) FROM commission_transactions WHERE vendor_id = $1 AND status = 'PENDING'",
            [vendorId]
        );

        if (parseInt(checkPending.rows[0].count) === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No pending commission nodes found for synchronization. Bandwidth at equilibrium.' 
            });
        }

        // Update all PENDING to REQUESTED
        await pool.query(
            "UPDATE commission_transactions SET status = 'REQUESTED' WHERE vendor_id = $1 AND status = 'PENDING'",
            [vendorId]
        );

        res.status(200).json({ 
            success: true, 
            message: 'Settlement request broadcasted to Admin Hub. Authorization pending.' 
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
    requestSettlement
};
