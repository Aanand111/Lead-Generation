const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

const getAllVendors = async (page = 1, limit = 10, search = '') => {
    const offset = (page - 1) * limit;

    let searchClause = '';
    let queryParams = [];

    if (search) {
        searchClause = ' AND (v.name ILIKE $1 OR v.email ILIKE $1 OR v.phone ILIKE $1 OR v.referral_code ILIKE $1)';
        queryParams.push(`%${search}%`);
    }

    const totalQuery = `SELECT COUNT(*) FROM vendors v WHERE v.referred_by_vendor_id IS NULL ${searchClause}`;
    const totalResult = await pool.query(totalQuery, queryParams);
    const total = parseInt(totalResult.rows[0].count, 10);

    const queryStr = `
        SELECT 
            v.*, 
            COALESCE(r_count.count, 0) as total_referrals,
            COALESCE(e_total.amount, 0) as total_earnings
        FROM vendors v
        LEFT JOIN users u ON v.phone = u.phone
        LEFT JOIN (
            SELECT u_inner.phone, COUNT(*) as count 
            FROM vendors v_inner
            JOIN vendors v_parent ON v_inner.referred_by_vendor_id = v_parent.id
            JOIN users u_inner ON v_parent.phone = u_inner.phone
            GROUP BY u_inner.phone
        ) r_count ON v.phone = r_count.phone
        LEFT JOIN (
            SELECT vendor_id, SUM(amount) as amount 
            FROM commission_transactions 
            WHERE status = 'COMPLETED'
            GROUP BY vendor_id
        ) e_total ON u.id = e_total.vendor_id
        WHERE v.referred_by_vendor_id IS NULL
        ${searchClause}
        ORDER BY v.created_at DESC
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(limit, offset);
    const result = await pool.query(queryStr, queryParams);

    // Global Stats for dashboard cards
    const globalStatsRes = await pool.query(`
        SELECT 
            (SELECT COUNT(*) FROM vendors WHERE referred_by_vendor_id IS NULL) as total_vendors,
            (SELECT COUNT(*) FROM vendors WHERE referred_by_vendor_id IS NOT NULL) as total_referrals,
            (SELECT COALESCE(SUM(amount), 0) FROM commission_transactions WHERE status = 'COMPLETED') as total_earnings
    `);

    return { 
        vendors: result.rows, 
        total,
        globalStats: {
            totalVendors: parseInt(globalStatsRes.rows[0].total_vendors),
            totalReferrals: parseInt(globalStatsRes.rows[0].total_referrals),
            totalEarnings: parseFloat(globalStatsRes.rows[0].total_earnings)
        }
    };
};

const createVendor = async (data) => {
    const { name, phone, email, password, referral_code, referred_by_vendor_id, status } = data;
    const query = `
        INSERT INTO vendors (name, phone, email, password, referral_code, referred_by_vendor_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `;

    const values = [name, phone, email, password, referral_code, referred_by_vendor_id || null, status || 'Active'];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const updateVendorStatus = async (id, status) => {
    const query = `
        UPDATE vendors
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
};

const deleteVendor = async (id) => {
    const query = `DELETE FROM vendors WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const updateVendor = async (id, data) => {
    const { name, phone, email, password, referral_code, referred_by_vendor_id, status } = data;
    const query = `
        UPDATE vendors 
        SET 
            name = COALESCE(NULLIF($1, ''), name),
            phone = COALESCE(NULLIF($2, ''), phone),
            email = COALESCE(NULLIF($3, ''), email),
            password = COALESCE(NULLIF($4, ''), password),
            referral_code = COALESCE(NULLIF($5, ''), referral_code),
            referred_by_vendor_id = COALESCE($6, referred_by_vendor_id),
            status = COALESCE(NULLIF($7, ''), status),
            updated_at = NOW()
        WHERE id = $8
        RETURNING *
    `;
    const values = [name, phone, email, password, referral_code, referred_by_vendor_id || null, status, id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const getVendorStats = async (vendorId) => {
    // 1. Get vendor basic info
    const vendorRes = await pool.query('SELECT * FROM vendors WHERE id = $1', [vendorId]);
    if (vendorRes.rows.length === 0) return null;
    const vendor = vendorRes.rows[0];

    // 2. Get referrals count and list
    const referralsRes = await pool.query(`
        SELECT id, name, phone, email, status, created_at 
        FROM vendors 
        WHERE referred_by_vendor_id = $1 
        ORDER BY created_at DESC
    `, [vendorId]);

    // 3. Get earnings summary from transactions (matching by matching user ID)
    const earningsRes = await pool.query(`
        SELECT ct.* FROM commission_transactions ct
        JOIN users u ON ct.vendor_id = u.id
        WHERE u.phone = $1
        ORDER BY ct.created_at DESC LIMIT 50
    `, [vendor.phone]);

    // 4. Calculate stats
    const totalEarnings = earningsRes.rows
        .filter(t => t.status === 'COMPLETED')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const pendingEarnings = earningsRes.rows
        .filter(t => t.status === 'PENDING')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    return {
        vendor,
        referrals: referralsRes.rows,
        earnings: earningsRes.rows,
        stats: {
            total_referrals: referralsRes.rows.length,
            total_earnings: totalEarnings,
            pending_earnings: pendingEarnings,
            active_referrals: referralsRes.rows.filter(r => r.status === 'Active').length
        }
    };
};

module.exports = {
    getAllVendors,
    createVendor,
    updateVendorStatus,
    deleteVendor,
    updateVendor,
    getVendorStats
};
