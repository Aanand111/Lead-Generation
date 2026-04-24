const { pool } = require('../config/db');

const findUserByPhone = async (phone) => {
    const result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    return result.rows[0];
};

const findUserByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

const findUserByIdentifier = async (identifier) => {
    const query = `
        SELECT u.*, 
               CASE 
                   WHEN u.full_name IS NOT NULL AND u.full_name != u.phone THEN u.full_name 
                   WHEN v.name IS NOT NULL AND v.name != u.phone THEN v.name 
                   ELSE COALESCE(u.full_name, v.name, u.phone) 
               END as computed_full_name
        FROM users u
        LEFT JOIN vendors v ON u.phone = v.phone
        WHERE u.email = $1 OR u.phone = $1
    `;
    const result = await pool.query(query, [identifier]);
    if (result.rows.length > 0) {
        const user = result.rows[0];
        user.full_name = user.computed_full_name; // override with the computed name
        return user;
    }
    return null;
};

const createUser = async (userData) => {
    const { phone, email, password_hash, role, referral_code, status, referred_by, full_name } = userData;
    const result = await pool.query(
        'INSERT INTO users (phone, email, password_hash, role, referral_code, status, referred_by, full_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [phone, email || null, password_hash, role, referral_code, status || 'ACTIVE', referred_by || null, full_name || null]
    );
    return result.rows[0];
};

const testFindUserById = async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
};

const findUserByReferralCode = async (code) => {
    const result = await pool.query('SELECT * FROM users WHERE referral_code = $1', [code]);
    return result.rows[0];
};

module.exports = {
    findUserByPhone,
    findUserByEmail,
    createUser,
    testFindUserById,
    findUserByReferralCode,
    findUserByIdentifier
};
