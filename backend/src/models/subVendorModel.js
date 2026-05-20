const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

const getAllSubVendors = async (page = 1, limit = 10, search = '') => {
    const offset = (page - 1) * limit;

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
            COALESCE(NULLIF(u.full_name, ''), 'Sub-Vendor') as name, 
            COALESCE(NULLIF(u.phone, ''), '0000000000') as phone, 
            COALESCE(NULLIF(u.email, ''), 'no-email@example.com') as email, 
            COALESCE(NULLIF(u.referral_code, ''), '') as referral_code, 
            u.status, 
            u.created_at,
            parent.full_name as vendor_name
        FROM users u
        LEFT JOIN users parent ON u.referred_by = parent.id
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
        status: (row.status === 'ACTIVE' || row.status === 'Active') ? 'Active' : 'Inactive'
    }));

    return { subVendors, total };
};

const createSubVendor = async (data) => {
    const { name, phone, email, password, referral_code, referred_by_vendor_id, status } = data;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const mappedStatus = (status && status.toLowerCase() === 'inactive') ? 'BLOCKED' : 'ACTIVE';
    
    const query = `
        INSERT INTO users (full_name, phone, email, password_hash, referral_code, referred_by, status, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'vendor')
        RETURNING id, full_name as name, phone, email, referral_code, referred_by as referred_by_vendor_id, status, created_at
    `;
    const values = [name, phone, email, hashedPassword, referral_code, referred_by_vendor_id, mappedStatus];
    const result = await pool.query(query, values);
    const row = result.rows[0];
    return { ...row, status: row.status === 'ACTIVE' ? 'Active' : 'Inactive' };
};

const updateSubVendor = async (id, data) => {
    const { name, phone, email, password, referral_code, referred_by_vendor_id, status } = data;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
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
        WHERE id = $8 AND role = 'vendor' AND referred_by IS NOT NULL
        RETURNING id, full_name as name, phone, email, referral_code, referred_by as referred_by_vendor_id, status
    `;
    const values = [name, phone, email, hashedPassword, referral_code, referred_by_vendor_id, mappedStatus, id];
    const result = await pool.query(query, values);
    if (!result.rows[0]) return null;
    const row = result.rows[0];
    return { ...row, status: row.status === 'ACTIVE' ? 'Active' : 'Inactive' };
};

const deleteSubVendor = async (id) => {
    const query = `DELETE FROM users WHERE id=$1 AND role = 'vendor' AND referred_by IS NOT NULL RETURNING id`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const getSubVendorById = async (id) => {
    const query = `
        SELECT 
            u.id, 
            COALESCE(NULLIF(u.full_name, ''), 'Sub-Vendor') as name, 
            COALESCE(NULLIF(u.phone, ''), '0000000000') as phone, 
            COALESCE(NULLIF(u.email, ''), 'no-email@example.com') as email, 
            COALESCE(NULLIF(u.referral_code, ''), '') as referral_code, 
            u.status, 
            u.referred_by as referred_by_vendor_id,
            'Unknown' as gender
        FROM users u
        WHERE u.id = $1 AND u.role = 'vendor' AND u.referred_by IS NOT NULL
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
