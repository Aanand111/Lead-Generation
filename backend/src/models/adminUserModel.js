const { pool } = require('../config/db');

// Ensure only vendor and user roles are listed (excluding admins)
// Ensure only vendor and user roles are listed (excluding admins)
const getAllUsers = async (page = 1, limit = 10, search = '', roleFilter = '') => {
    const offset = (page - 1) * limit;
    let queryStr = `
        SELECT u.id, u.phone, u.full_name, u.role, u.status, u.wallet_balance, u.created_at, u.referral_code, u.custom_commission_rate, p.pincode, p.city, p.state 
        FROM users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
        WHERE u.role IN ('vendor', 'user')
    `;
    const queryParams = [];

    if (search) {
        queryStr += ` AND (u.phone ILIKE $${queryParams.length + 1} OR u.full_name ILIKE $${queryParams.length + 1})`;
        queryParams.push(`%${search}%`);
    }

    if (roleFilter) {
        queryStr += ` AND u.role = $${queryParams.length + 1}`;
        queryParams.push(roleFilter);
    }

    queryStr += ` ORDER BY u.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(queryStr, queryParams);

    // Get total count
    let countQueryStr = `SELECT COUNT(*) FROM users u WHERE u.role IN ('vendor', 'user')`;
    const countParams = [];
    if (search) {
        countQueryStr += ` AND (u.phone ILIKE $$1 OR u.full_name ILIKE $1)`;
        countParams.push(`%${search}%`);
    }
    if (roleFilter) {
        countQueryStr += ` AND u.role = $${countParams.length + 1}`;
        countParams.push(roleFilter);
    }
    const countResult = await pool.query(countQueryStr, countParams);

    return {
        users: result.rows,
        total: parseInt(countResult.rows[0].count),
    };
};

const updateVendorCommission = async (userId, rate) => {
    const result = await pool.query(
        'UPDATE users SET custom_commission_rate = $1 WHERE id = $2 AND role = \'vendor\' RETURNING id, custom_commission_rate',
        [rate, userId]
    );
    return result.rows[0];
};

const blockUnblockUser = async (userId, isBlocked) => {
    const status = isBlocked ? 'BLOCKED' : 'ACTIVE';
    const result = await pool.query(
        'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, phone, status',
        [status, userId]
    );
    return result.rows[0];
};

const adjustWalletBalance = async (userId, amount, transactionType, remarks) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Update balance
        const userRes = await client.query(
            'UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2 RETURNING id, wallet_balance',
            [amount, userId]
        );

        if (userRes.rows.length === 0) {
            throw new Error('User not found');
        }

        // Insert transaction record
        await client.query(
            'INSERT INTO transactions (user_id, type, amount, status, remarks) VALUES ($1, $2, $3, $4, $5)',
            [userId, transactionType, amount, 'COMPLETED', remarks]
        );

        await client.query('COMMIT');
        return userRes.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const getUserReferralTree = async (userId) => {
    // This query gets direct referrals only as per BRD
    const result = await pool.query(`
        SELECT u.id, u.full_name, u.phone, u.role, u.created_at, r.commission_earned, r.status
        FROM users u
        LEFT JOIN referrals r ON u.id = r.referred_user_id
        WHERE u.referred_by = $1
        ORDER BY u.created_at DESC
    `, [userId]);
    return result.rows;
};

const updateProfilePhoto = async (userId, photoUrl) => {
    const result = await pool.query(
        'UPDATE users SET profile_pic = $1 WHERE id = $2 RETURNING id, profile_pic',
        [photoUrl, userId]
    );
    return result.rows[0];
};


const updateProfile = async (userId, data) => {
    const { name, email } = data;
    const result = await pool.query(
        'UPDATE users SET full_name = COALESCE($1, full_name), email = COALESCE($3, email) WHERE id = $2 RETURNING id, full_name, email',
        [name, userId, email]
    );
    return result.rows[0];
};

const getCommissions = async (status = null) => {
    let queryStr = `
        SELECT ct.*, u.full_name as vendor_name, u.phone as vendor_phone
        FROM commission_transactions ct
        JOIN users u ON ct.vendor_id = u.id
    `;
    const queryParams = [];

    if (status) {
        queryStr += ` WHERE ct.status = $1`;
        queryParams.push(status);
    }

    queryStr += ` ORDER BY ct.created_at DESC`;
    const result = await pool.query(queryStr, queryParams);
    return result.rows;
};

const approveCommission = async (transactionId) => {
    const result = await pool.query(
        "UPDATE commission_transactions SET status = 'COMPLETED' WHERE id = $1 RETURNING id, amount, status",
        [transactionId]
    );
    return result.rows[0];
};

module.exports = {
    getAllUsers,
    blockUnblockUser,
    adjustWalletBalance,
    getUserReferralTree,
    updateProfilePhoto,
    updateProfile,
    updateVendorCommission,
    getCommissions,
    approveCommission
};
