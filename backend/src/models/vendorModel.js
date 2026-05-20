const { pool } = require('../config/db');

const getAllVendors = async (page = 1, limit = 10, search = '') => {
    const offset = (page - 1) * limit;

    let searchClause = '';
    let queryParams = [];

    if (search) {
        searchClause = ' AND (u.full_name ILIKE $1 OR u.email ILIKE $1 OR u.phone ILIKE $1 OR u.referral_code ILIKE $1)';
        queryParams.push(`%${search}%`);
    }

    const totalQuery = `SELECT COUNT(*) FROM users u WHERE u.role = 'vendor' AND u.referred_by IS NULL ${searchClause}`;
    const totalResult = await pool.query(totalQuery, queryParams);
    const total = parseInt(totalResult.rows[0].count, 10);

    const queryStr = `
        SELECT 
            u.id, 
            u.full_name as name, 
            u.phone, 
            u.email, 
            u.password_hash as password, 
            u.referral_code, 
            u.referred_by as referred_by_vendor_id,
            u.status, 
            u.created_at, 
            u.updated_at,
            COALESCE(r_count.count, 0) as total_referrals,
            COALESCE(u.total_earnings, 0) as commission_balance,
            COALESCE(u.total_earnings, 0) as total_earnings
        FROM users u
        LEFT JOIN (
            SELECT u_inner.phone, COUNT(*) as count 
            FROM users u_inner
            JOIN users u_parent ON u_inner.referred_by = u_parent.id
            WHERE u_inner.role = 'vendor' AND u_parent.role = 'vendor'
            GROUP BY u_inner.phone
        ) r_count ON u.phone = r_count.phone
        WHERE u.role = 'vendor' AND u.referred_by IS NULL
        ${searchClause}
        ORDER BY u.created_at DESC
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(limit, offset);
    const result = await pool.query(queryStr, queryParams);

    // Standardize status
    const vendors = result.rows.map(v => ({
        ...v,
        status: (v.status === 'ACTIVE' || v.status === 'Active') ? 'Active' : 'Inactive'
    }));

    // Global Stats for dashboard cards
    const globalStatsRes = await pool.query(`
        SELECT 
            (SELECT COUNT(*) FROM users WHERE role = 'vendor' AND referred_by IS NULL) as total_vendors,
            (SELECT COUNT(*) FROM users WHERE role = 'vendor' AND referred_by IS NOT NULL) as total_referrals,
            (SELECT COALESCE(SUM(amount), 0) FROM commission_transactions WHERE status = 'COMPLETED') as total_earnings
    `);

    return { 
        vendors, 
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
    const mappedStatus = (status && status.toLowerCase() === 'inactive') ? 'BLOCKED' : 'ACTIVE';
    const query = `
        INSERT INTO users (full_name, phone, email, password_hash, referral_code, referred_by, status, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'vendor')
        RETURNING id, full_name as name, phone, email, referral_code, referred_by as referred_by_vendor_id, status, created_at
    `;

    const values = [name, phone, email, password, referral_code, referred_by_vendor_id || null, mappedStatus];

    const result = await pool.query(query, values);
    const row = result.rows[0];
    return { ...row, status: row.status === 'ACTIVE' ? 'Active' : 'Inactive' };
};

const updateVendorStatus = async (id, status) => {
    const mappedStatus = (status && status.toLowerCase() === 'inactive') ? 'BLOCKED' : 'ACTIVE';
    const query = `
        UPDATE users
        SET status = $1, updated_at = NOW()
        WHERE id = $2 AND role = 'vendor'
        RETURNING id, full_name as name, status
    `;
    const result = await pool.query(query, [mappedStatus, id]);
    if (!result.rows[0]) return null;
    return { ...result.rows[0], status: result.rows[0].status === 'ACTIVE' ? 'Active' : 'Inactive' };
};

const deleteVendor = async (id) => {
    const query = `DELETE FROM users WHERE id = $1 AND role = 'vendor' RETURNING id`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const updateVendor = async (id, data) => {
    const { name, phone, email, password, referral_code, referred_by_vendor_id, status } = data;
    const mappedStatus = status ? ((status.toLowerCase() === 'inactive') ? 'BLOCKED' : 'ACTIVE') : null;
    
    const query = `
        UPDATE users 
        SET 
            full_name = COALESCE(NULLIF($1, ''), full_name),
            phone = COALESCE(NULLIF($2, ''), phone),
            email = COALESCE(NULLIF($3, ''), email),
            password_hash = COALESCE(NULLIF($4, ''), password_hash),
            referral_code = COALESCE(NULLIF($5, ''), referral_code),
            referred_by = COALESCE($6, referred_by),
            status = COALESCE(NULLIF($7, ''), status),
            updated_at = NOW()
        WHERE id = $8 AND role = 'vendor'
        RETURNING id, full_name as name, phone, email, referral_code, referred_by as referred_by_vendor_id, status
    `;
    const values = [name, phone, email, password, referral_code, referred_by_vendor_id || null, mappedStatus, id];
    const result = await pool.query(query, values);
    if (!result.rows[0]) return null;
    const row = result.rows[0];
    return { ...row, status: row.status === 'ACTIVE' ? 'Active' : 'Inactive' };
};

const getVendorStats = async (vendorId) => {
    // 1. Get vendor basic info
    const vendorRes = await pool.query(
        `SELECT id, full_name as name, phone, email, referral_code, status, created_at
        FROM users WHERE id = $1 AND role = 'vendor'`,
        [vendorId]
    );
    if (vendorRes.rows.length === 0) return null;
    const vendor = vendorRes.rows[0];
    vendor.status = vendor.status === 'ACTIVE' ? 'Active' : 'Inactive';

    // 2. Get referrals count and list
    const referralsRes = await pool.query(
        `SELECT id, full_name as name, phone, email, status, created_at 
        FROM users 
        WHERE referred_by = $1 AND role = 'vendor'
        ORDER BY created_at DESC`,
        [vendorId]
    );

    const mappedReferrals = referralsRes.rows.map(r => ({
        ...r,
        status: r.status === 'ACTIVE' ? 'Active' : 'Inactive'
    }));

    // 3. Get earnings summary from transactions
    const earningsRes = await pool.query(
        `SELECT ct.* FROM commission_transactions ct
        WHERE ct.vendor_id = $1
        ORDER BY ct.created_at DESC LIMIT 50`,
        [vendorId]
    );

    // 4. Calculate stats
    const totalEarnings = earningsRes.rows
        .filter(t => t.status === 'COMPLETED')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const pendingEarnings = earningsRes.rows
        .filter(t => t.status === 'PENDING')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    return {
        vendor,
        referrals: mappedReferrals,
        earnings: earningsRes.rows,
        stats: {
            total_referrals: mappedReferrals.length,
            total_earnings: totalEarnings,
            pending_earnings: pendingEarnings,
            active_referrals: mappedReferrals.filter(r => r.status === 'Active').length
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
