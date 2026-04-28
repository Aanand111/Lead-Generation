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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const queryStr = `
            SELECT 
                u.id, u.phone, 
                CASE 
                    WHEN u.full_name IS NOT NULL AND u.full_name != u.phone THEN u.full_name 
                    WHEN v.name IS NOT NULL AND v.name != u.phone THEN v.name 
                    ELSE COALESCE(u.full_name, v.name, 'Sub-Vendor') 
                END as full_name,
                u.role, u.status, u.created_at, u.last_login,
                GREATEST(
                    u.last_login,
                    (SELECT MAX(created_at) FROM transactions t WHERE t.user_id = u.id AND t.type IN ('PURCHASE', 'PLAN_PURCHASE')),
                    (SELECT MAX(created_at) FROM users u_sub WHERE u_sub.referred_by = u.id)
                ) as last_activity,
                (SELECT COALESCE(SUM(amount), 0) FROM transactions t WHERE t.user_id = u.id AND (t.type = 'PURCHASE' OR t.type = 'PLAN_PURCHASE')) as total_revenue
            FROM users u 
            LEFT JOIN vendors v ON u.phone = v.phone
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
        const { phone, email, password, pincode, city, state } = req.body;
        const full_name = req.body.full_name || req.body.name || `User_${phone?.slice(-4) || 'Node'}`;

        if (!email) return res.status(400).json({ success: false, message: 'Email is required for user registration.' });

        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newReferralCode = `USR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const result = await pool.query(
            'INSERT INTO users (phone, email, password_hash, full_name, role, referred_by, referral_code) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [phone, email, hashedPassword, full_name, 'user', vendorId, newReferralCode]
        );

        const newUser = result.rows[0];

        // Synchronize with 'user_profiles' for pincode visibility in Admin Panel
        if (pincode || city || state) {
            await pool.query(
                'INSERT INTO user_profiles (user_id, pincode, city, state) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET pincode = EXCLUDED.pincode, city = EXCLUDED.city, state = EXCLUDED.state',
                [newUser.id, pincode, city, state]
            );
        }

        res.status(201).json({ success: true, message: 'User referred & added successfully', data: newUser });
    } catch (error) {
        next(error);
    }
};

const referVendor = async (req, res, next) => {
    try {
        const vendorId = req.user.id;
        const { phone, email, password, pincode, city, state } = req.body;
        // Handle both full_name and name to ensure compatibility with different frontend versions
        const full_name = req.body.full_name || req.body.name || `Vendor_${phone?.slice(-4) || 'Node'}`;

        if (!email) return res.status(400).json({ success: false, message: 'Email is required for sub-vendor registration.' });
        if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required.' });

        // BRD Section 1.3: Secondary Vendor Restriction
        // Primary Vendors have referred_by = NULL (added by Admin).
        // Secondary/Sub-Vendors have referred_by = [Primary Vendor ID].
        const checkVendor = await pool.query('SELECT referred_by, status, full_name, phone FROM users WHERE id = $1', [vendorId]);
        const vendor = checkVendor.rows[0];

        if (!vendor || vendor.status !== 'ACTIVE') {
            return res.status(403).json({ success: false, message: 'Unauthorized: Your account is inactive or you do not have permission.' });
        }

        if (vendor.referred_by) {
            console.warn(`[HIERARCHY_BLOCK] Sub-Vendor ${vendorId} attempted to add a 3rd-tier vendor.`);
            return res.status(403).json({ 
                message: 'Access Denied: Only primary vendors can refer other vendors.' 
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
            const userRes = await pool.query('SELECT phone, email, full_name, referral_code, password_hash FROM users WHERE id = $1', [vendorId]);
            if (userRes.rows.length > 0) {
                const parent = userRes.rows[0];
                const vendorRes = await pool.query(
                    'SELECT id FROM vendors WHERE phone = $1 OR email = $2 LIMIT 1',
                    [parent.phone, parent.email]
                );
                
                if (vendorRes.rows.length > 0) {
                    registryVendorId = vendorRes.rows[0].id;
                } else {
                    // Sync parent to registry if missing
                    const vendorDb = require('../models/vendorModel');
                    const pRegRes = await vendorDb.createVendor({
                        name: parent.full_name || parent.phone || 'Primary Vendor',
                        phone: parent.phone,
                        email: parent.email,
                        password: parent.password_hash,
                        referral_code: parent.referral_code,
                        referred_by_vendor_id: null,
                        status: 'Active'
                    });
                    registryVendorId = pRegRes.id;
                }
            }
        } catch (e) {
            console.error('Failed to resolve registry ID:', e.message);
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

        const newUser = result.rows[0];

        // Synchronize with 'user_profiles' for pincode visibility
        if (pincode || city || state) {
            await pool.query(
                'INSERT INTO user_profiles (user_id, pincode, city, state) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET pincode = EXCLUDED.pincode, city = EXCLUDED.city, state = EXCLUDED.state',
                [newUser.id, pincode, city, state]
            );
        }

        // Emit real-time notification for Admin
        try {
            const { broadcast } = require('../utils/socket');
            broadcast('new_vendor_referral', {
                message: `New Sub-Vendor Added: ${full_name}`,
                phone: phone,
                referrer: req.user.full_name || 'Primary Node',
                timestamp: new Date()
            });
        } catch (sErr) {
            console.error('[SOCKET_ERROR] Failed to emit referral signal:', sErr.message);
        }

        res.status(201).json({ 
            success: true, 
            message: 'Sub-Vendor registered successfully.', 
            data: { id: result.rows[0].id, phone: result.rows[0].phone, email: result.rows[0].email, referral_code: newReferralCode } 
        });
    } catch (error) {
        if (error.code === '23505') { // Unique constraint (phone/code)
             return res.status(400).json({ success: false, message: 'Identity Conflict: Phone number or Referral code already exists.' });
        }
        next(error);
    }
};

const requestSettlement = async (req, res, next) => {
    try {
        const vendorId = req.user.id;

        // Check if there are any pending commissions to request
        const checkPending = await pool.query(
            "SELECT COUNT(*), COALESCE(SUM(amount), 0) as total_amount FROM commission_transactions WHERE vendor_id = $1 AND status = 'PENDING'",
            [vendorId]
        );

        if (parseInt(checkPending.rows[0].count) === 0) {
            return res.status(400).json({ 
                message: 'You have no pending commissions to request at this time.' 
            });
        }

        const amount = parseFloat(checkPending.rows[0].total_amount);

        // Update all PENDING to REQUESTED
        await pool.query(
            "UPDATE commission_transactions SET status = 'REQUESTED' WHERE vendor_id = $1 AND status = 'PENDING'",
            [vendorId]
        );

        // Get vendor info for notification
        let vendorName = 'A Vendor';
        try {
            const vendorRes = await pool.query('SELECT full_name FROM users WHERE id = $1', [vendorId]);
            if (vendorRes.rows.length > 0) {
                vendorName = vendorRes.rows[0].full_name;
            }
        } catch (err) {
            console.error('[VENDOR_INFO_ERROR] Failed to fetch vendor name:', err.message);
        }

        // Add socket notification exclusively to Admins
        try {
            const { sendToUser } = require('../utils/socket');
            
            // Get all admin users
            const adminsRes = await pool.query("SELECT id FROM users WHERE role = 'admin'");
            const adminIds = adminsRes.rows.map(row => row.id.toString());
            
            adminIds.forEach(adminId => {
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
            });
        } catch (sErr) {
            console.error('[SOCKET_ERROR] Failed to emit commission request notification:', sErr.message);
        }

        res.status(200).json({ 
            success: true, 
            message: 'Payout request submitted successfully. Our team will review it shortly.' 
        });
    } catch (error) {
        next(error);
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

        // If approved and is a vendor, sync with 'vendors' registry table for Admin visibility
        if (action === 'APPROVE' && approvedUser.role === 'vendor') {
            try {
                const vendorDb = require('../models/vendorModel');
                
                // Get parent vendor's registry ID
                let parentRegistryId = null;
                const parentRes = await pool.query('SELECT phone, email, full_name, referral_code, password_hash FROM users WHERE id = $1', [vendorId]);
                if (parentRes.rows.length > 0) {
                    const parent = parentRes.rows[0];
                    const regRes = await pool.query('SELECT id FROM vendors WHERE phone = $1 OR email = $2', [parent.phone, parent.email]);
                    if (regRes.rows.length > 0) {
                        parentRegistryId = regRes.rows[0].id;
                    } else {
                        // Parent is missing from registry (likely self-registered & approved but not synced)
                        // Sync parent first to maintain hierarchical integrity
                        const pRegRes = await vendorDb.createVendor({
                            name: parent.full_name,
                            phone: parent.phone,
                            email: parent.email,
                            password: parent.password_hash,
                            referral_code: parent.referral_code,
                            referred_by_vendor_id: null, // Parent is top-level if missing
                            status: 'Active'
                        });
                        parentRegistryId = pRegRes.id;
                    }
                }

                await vendorDb.createVendor({
                    name: approvedUser.full_name || approvedUser.phone || 'Sub-Vendor',
                    phone: approvedUser.phone,
                    email: approvedUser.email,
                    password: approvedUser.password_hash,
                    referral_code: approvedUser.referral_code,
                    referred_by_vendor_id: parentRegistryId,
                    status: 'Active'
                });
            } catch (syncErr) {
                console.error('[SYNC_ERROR] Failed to populate vendors registry during approval:', syncErr.message);
            }
        }

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
