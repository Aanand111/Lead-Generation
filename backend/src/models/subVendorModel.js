const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

const getAllSubVendors = async (page = 1, limit = 10, search = '') => {
    const offset = (page - 1) * limit;

    // ── AUTO-REPAIR DISCREPANCY ──────────────────────────────────────
    // Ensure that any user with role 'vendor' and a referrer exists in the 'vendors' table.
    // This fixes cases where users register via referral codes but aren't added to metadata table.
    await pool.query(`
        INSERT INTO vendors (name, phone, email, referral_code, referred_by_vendor_id, status)
        SELECT u.full_name, u.phone, u.email, u.referral_code, u.referred_by, 
               CASE WHEN u.status = 'ACTIVE' THEN 'Active' ELSE 'Inactive' END
        FROM users u
        WHERE u.role = 'vendor' AND u.referred_by IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM vendors v WHERE v.phone = u.phone OR v.email = u.email)
    `);

    let totalQuery = `
        SELECT COUNT(*) 
        FROM users u 
        WHERE u.role = 'vendor' AND u.referred_by IS NOT NULL
    `;
    let totalParams = [];

    if (search) {
        totalQuery += ` AND (u.full_name ILIKE $1 OR u.email ILIKE $1 OR u.phone ILIKE $1 OR u.referral_code ILIKE $1)`;
        totalParams.push(`%${search}%`);
    }

    const totalResult = await pool.query(totalQuery, totalParams);
    const total = parseInt(totalResult.rows[0].count, 10);

    let queryStr = `
        SELECT 
            u.id, 
            COALESCE(NULLIF(v.name, ''), NULLIF(u.full_name, ''), 'Sub-Vendor') as name, 
            COALESCE(NULLIF(v.phone, ''), NULLIF(u.phone, ''), '0000000000') as phone, 
            COALESCE(NULLIF(v.email, ''), NULLIF(u.email, ''), 'no-email@example.com') as email, 
            COALESCE(NULLIF(v.referral_code, ''), NULLIF(u.referral_code, ''), '') as referral_code, 
            u.status, 
            u.created_at,
            parent.full_name as vendor_name
        FROM users u
        LEFT JOIN users parent ON u.referred_by = parent.id
        LEFT JOIN vendors v ON (u.phone = v.phone OR u.email = v.email)
        WHERE u.role = 'vendor' AND u.referred_by IS NOT NULL
    `;
    let queryParams = [];

    if (search) {
        queryStr += ` AND (u.full_name ILIKE $1 OR u.email ILIKE $1 OR u.phone ILIKE $1 OR u.referral_code ILIKE $1)`;
        queryParams.push(`%${search}%`);
    }

    queryStr += ` ORDER BY u.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(queryStr, queryParams);

    // Standardize status for frontend (ACTIVE -> Active, etc.)
    const subVendors = result.rows.map(row => ({
        ...row,
        status: row.status === 'ACTIVE' ? 'Active' : (row.status === 'PENDING' ? 'Active' : 'Inactive')
    }));

    return { subVendors, total };
};

const createSubVendor = async (data) => {
    const { name, phone, email, password, referral_code, referred_by_vendor_id, status, gender } = data;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const query = `
        INSERT INTO vendors (name, phone, email, password, referral_code, referred_by_vendor_id, status, gender)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;
    const values = [name, phone, email, hashedPassword, referral_code, referred_by_vendor_id, status || 'Active', gender];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const updateSubVendor = async (id, data) => {
    const { name, phone, email, password, referral_code, referred_by_vendor_id, status, gender } = data;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
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
            gender = COALESCE(NULLIF($8, ''), gender),
            updated_at = NOW()
        WHERE id = $9 AND referred_by_vendor_id IS NOT NULL
        RETURNING *
    `;
    const values = [name, phone, email, hashedPassword, referral_code, referred_by_vendor_id, status, gender, id];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const deleteSubVendor = async (id) => {
    const query = `DELETE FROM vendors WHERE id=$1 AND referred_by_vendor_id IS NOT NULL RETURNING id`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const getSubVendorById = async (id) => {
    const query = `
        SELECT 
            u.id, 
            COALESCE(NULLIF(v.name, ''), NULLIF(u.full_name, ''), 'Sub-Vendor') as name, 
            COALESCE(NULLIF(v.phone, ''), NULLIF(u.phone, ''), '0000000000') as phone, 
            COALESCE(NULLIF(v.email, ''), NULLIF(u.email, ''), 'no-email@example.com') as email, 
            COALESCE(NULLIF(v.referral_code, ''), NULLIF(u.referral_code, ''), '') as referral_code, 
            u.status, 
            u.referred_by as referred_by_vendor_id,
            v.gender
        FROM users u
        LEFT JOIN vendors v ON (v.phone = u.phone AND u.phone != '')
        WHERE u.id = $1
        LIMIT 1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
            ...row,
            status: (row.status === 'ACTIVE' || row.status === 'Active') ? 'Active' : 'Inactive'
        };
    }
    return null;
};

module.exports = {
    getAllSubVendors,
    getSubVendorById,
    createSubVendor,
    updateSubVendor,
    deleteSubVendor
};
