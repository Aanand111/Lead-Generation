const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

const getAllSubVendors = async (page = 1, limit = 10, search = '') => {
    const offset = (page - 1) * limit;

    let totalQuery = 'SELECT COUNT(*) FROM vendors WHERE referred_by_vendor_id IS NOT NULL';
    let totalParams = [];

    let queryStr = `
        SELECT s.*, v.name as vendor_name
        FROM vendors s
        LEFT JOIN vendors v ON s.referred_by_vendor_id = v.id
        WHERE s.referred_by_vendor_id IS NOT NULL
    `;
    let queryParams = [];

    if (search) {
        totalQuery += ' AND (s.name ILIKE $1 OR s.email ILIKE $1 OR s.phone ILIKE $1 OR s.referral_code ILIKE $1)';
        totalParams.push(`%${search}%`);

        queryStr += ' AND (s.name ILIKE $1 OR s.email ILIKE $1 OR s.phone ILIKE $1 OR s.referral_code ILIKE $1)';
        queryParams.push(`%${search}%`, limit, offset);
        queryStr += ' ORDER BY s.created_at DESC LIMIT $2 OFFSET $3';
    } else {
        queryParams.push(limit, offset);
        queryStr += ' ORDER BY s.created_at DESC LIMIT $1 OFFSET $2';
    }

    const totalResult = await pool.query(totalQuery, totalParams);
    const total = parseInt(totalResult.rows[0].count, 10);

    const result = await pool.query(queryStr, queryParams);

    return { subVendors: result.rows, total };
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
            name = COALESCE($1, name),
            phone = COALESCE($2, phone),
            email = COALESCE($3, email),
            password = COALESCE($4, password),
            referral_code = COALESCE($5, referral_code),
            referred_by_vendor_id = COALESCE($6, referred_by_vendor_id),
            status = COALESCE($7, status),
            gender = COALESCE($8, gender),
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

module.exports = {
    getAllSubVendors,
    createSubVendor,
    updateSubVendor,
    deleteSubVendor
};
