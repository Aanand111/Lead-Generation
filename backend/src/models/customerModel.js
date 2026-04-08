const { pool } = require('../config/db');

/**
 * Aggregates all Customer nodes from the primary User directory.
 * Includes members registered via the mobile application (Vendor Referrals) 
 * and those manually added as high-priority leads.
 */
const getAllCustomers = async (page = 1, limit = 10, search = '') => {
    const offset = (page - 1) * limit;

    // Fetch customers with pagination and search functionality
    // This query handles active users and maps their profile details
    let searchClause = " WHERE u.role = 'user'";
    let queryParams = [];

    if (search) {
        searchClause += ` AND (u.full_name ILIKE $1 OR u.phone ILIKE $1 OR u.referral_code ILIKE $1)`;
        queryParams.push(`%${search}%`);
    }

    const countQuery = `SELECT COUNT(*) FROM users u ${searchClause}`;
    const totalResult = await pool.query(countQuery, queryParams);
    const total = parseInt(totalResult.rows[0].count, 10);

    const queryStr = `
        SELECT 
            u.id, 
            u.full_name as name, 
            u.phone, 
            u.email, 
            u.status, 
            u.created_at,
            up.pincode,
            up.city,
            up.state,
            referrer.full_name as referral
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN users referrer ON u.referred_by = referrer.id
        ${searchClause}
        ORDER BY u.created_at DESC
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(limit, offset);
    const result = await pool.query(queryStr, queryParams);

    return { 
        customers: result.rows.map(row => ({
            ...row,
            status: row.status === 'ACTIVE' ? 'Active' : 'Inactive'
        })), 
        total 
    };
};

const createCustomer = async (data) => {
    const { name, email, phone, whatsapp, referral, state, city, pincode, status } = data;
    
    // Create a new customer record
    // Adds a user and initializes their profile entry
    const query = `
        INSERT INTO users (full_name, email, phone, role, status)
        VALUES ($1, $2, $3, 'user', $4)
        RETURNING *
    `;

    const values = [name, email, phone, status === 'Active' ? 'ACTIVE' : 'BLOCKED'];
    const result = await pool.query(query, values);
    const newUser = result.rows[0];

    // Initialize profile
    await pool.query(
        'INSERT INTO user_profiles (user_id, pincode, city, state) VALUES ($1, $2, $3, $4)',
        [newUser.id, pincode, city, state]
    );

    return newUser;
};

const updateCustomer = async (id, data) => {
    const { name, email, phone, status, pincode, city, state } = data;

    // Update customer core details and profile metadata
    // Uses ON CONFLICT to sync profile data seamlessly
    const query = `
        UPDATE users
        SET 
            full_name = COALESCE($1, full_name),
            email = COALESCE($2, email),
            phone = COALESCE($3, phone),
            status = $4,
            updated_at = NOW()
        WHERE id = $5 AND role = 'user'
        RETURNING *
    `;

    const values = [name, email, phone, status === 'Active' ? 'ACTIVE' : 'BLOCKED', id];
    const result = await pool.query(query, values);
    
    if (result.rows.length > 0) {
        await pool.query(
            `INSERT INTO user_profiles (user_id, pincode, city, state) 
             VALUES ($1, $2, $3, $4) 
             ON CONFLICT (user_id) DO UPDATE SET 
             pincode = EXCLUDED.pincode, city = EXCLUDED.city, state = EXCLUDED.state`,
            [id, pincode, city, state]
        );
    }

    return result.rows[0];
};

const updateCustomerStatus = async (id, status) => {
    // Update specific account status (Active/Blocked)
    const query = `
        UPDATE users
        SET status = $1, updated_at = NOW()
        WHERE id = $2 AND role = 'user'
        RETURNING *
    `;
    const result = await pool.query(query, [status === 'Active' ? 'ACTIVE' : 'BLOCKED', id]);
    return result.rows[0];
};

const deleteCustomer = async (id) => {
    // Remove customer from the system
    // Note: Soft delete or status disabling is generally preferred over hard delete
    const query = `DELETE FROM users WHERE id = $1 AND role = 'user' RETURNING id`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

module.exports = {
    getAllCustomers,
    createCustomer,
    updateCustomer,
    updateCustomerStatus,
    deleteCustomer
};
