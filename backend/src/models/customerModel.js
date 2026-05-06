const { pool } = require('../config/db');

const bcrypt = require('bcryptjs');

/**
 * Aggregates all Customer nodes from the primary User directory.
 * Includes members registered via the mobile application (Vendor Referrals) 
 * and those manually added as high-priority leads.
 */
const getAllCustomers = async (page = 1, limit = 10, search = '') => {
    const offset = (page - 1) * limit;
    let queryParams = [];

    if (search) {
        queryParams.push(`%${search}%`);
    }

    const countQuery = `
        SELECT COUNT(*) FROM (
            SELECT u.id FROM users u WHERE u.role = 'user'
            UNION ALL
            SELECT l.id FROM leads l WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.phone = l.customer_phone AND u.role = 'user')
        ) AS total_count
        ${search ? ` WHERE EXISTS (SELECT 1 FROM users u2 WHERE u2.id = total_count.id AND (u2.full_name ILIKE $1 OR u2.phone ILIKE $1)) OR EXISTS (SELECT 1 FROM leads l2 WHERE l2.id = total_count.id AND (l2.customer_name ILIKE $1 OR l2.customer_phone ILIKE $1))` : ''}
    `;
    
    // Simpler count query for performance and reliability
    const totalResult = await pool.query(`
        SELECT (
            (SELECT COUNT(*) FROM users WHERE role = 'user' ${search ? "AND (full_name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1)" : ""}) + 
            (SELECT COUNT(*) FROM leads l WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.phone = l.customer_phone AND u.role = 'user') ${search ? "AND (l.customer_name ILIKE $1 OR l.customer_phone ILIKE $1 OR l.customer_email ILIKE $1)" : ""})
        ) as count
    `, queryParams);
    
    const total = parseInt(totalResult.rows[0].count, 10);

    const queryStr = `
        WITH combined_customers AS (
            SELECT 
                u.id, 
                COALESCE(NULLIF(u.full_name, ''), NULLIF(u.phone, ''), 'UNKNOWN USER') as name, 
                u.phone, 
                u.email, 
                u.status, 
                u.created_at,
                up.pincode,
                up.city,
                up.state,
                referrer.full_name as referral,
                'USER' as type
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            LEFT JOIN users referrer ON u.referred_by = referrer.id
            WHERE u.role = 'user'
            UNION ALL
            SELECT 
                l.id, 
                COALESCE(NULLIF(l.customer_name, ''), NULLIF(l.customer_phone, ''), 'UNKNOWN USER') as name, 
                l.customer_phone as phone, 
                l.customer_email as email, 
                'ACTIVE' as status, 
                l.created_at,
                l.pincode,
                l.city,
                l.state,
                creator.full_name as referral,
                'LEAD' as type
            FROM leads l
            LEFT JOIN users creator ON l.created_by = creator.id
            WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.phone = l.customer_phone AND u.role = 'user')
        )
        SELECT * FROM combined_customers
        ${search ? ` WHERE (name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1)` : ''}
        ORDER BY created_at DESC
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
    const { name, email, phone, whatsapp, referral, state, city, pincode, status, password } = data;

    // Create a new customer record
    // Adds a user and initializes their profile entry
    // Use provided password if available, otherwise fallback to default '123456'
    const salt = await bcrypt.genSalt(8);
    const password_hash = await bcrypt.hash(password || '123456', salt);

    const query = `
        INSERT INTO users (full_name, email, phone, role, status, password_hash)
        VALUES ($1, $2, $3, 'user', $4, $5)
        RETURNING *
    `;

    const values = [name, email, phone, status === 'Active' ? 'ACTIVE' : 'BLOCKED', password_hash];
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

    // Try updating users table first (for registered members)
    const userQuery = `
        UPDATE users
        SET 
            full_name = COALESCE(NULLIF($1, ''), full_name),
            email = COALESCE(NULLIF($2, ''), email),
            phone = COALESCE(NULLIF($3, ''), phone),
            status = $4,
            updated_at = NOW()
        WHERE id = $5 AND role = 'user'
        RETURNING *
    `;

    const userValues = [name, email, phone, status === 'Active' ? 'ACTIVE' : 'BLOCKED', id];
    const userResult = await pool.query(userQuery, userValues);

    if (userResult.rows.length > 0) {
        await pool.query(
            `INSERT INTO user_profiles (user_id, pincode, city, state) 
             VALUES ($1, $2, $3, $4) 
             ON CONFLICT (user_id) DO UPDATE SET 
             pincode = EXCLUDED.pincode, city = EXCLUDED.city, state = EXCLUDED.state`,
            [id, pincode, city, state]
        );
        return { ...userResult.rows[0], type: 'USER' };
    }

    // If not found in users, try updating leads table (for potential members)
    const leadQuery = `
        UPDATE leads
        SET 
            customer_name = COALESCE(NULLIF($1, ''), customer_name),
            customer_email = COALESCE(NULLIF($2, ''), customer_email),
            customer_phone = COALESCE(NULLIF($3, ''), customer_phone),
            pincode = COALESCE(NULLIF($4, ''), pincode),
            city = COALESCE(NULLIF($5, ''), city),
            state = COALESCE(NULLIF($6, ''), state)
        WHERE id = $7
        RETURNING *
    `;

    const leadValues = [name, email, phone, pincode, city, state, id];
    const leadResult = await pool.query(leadQuery, leadValues);

    if (leadResult.rows.length > 0) {
        return { ...leadResult.rows[0], type: 'LEAD' };
    }

    return null;
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
    
    if (result.rows.length > 0) return result.rows[0];

    // If not a user, leads are implicitly "Active" unless deleted, so we just return a mock success
    // or we could update lead status if we had a blocked status for leads.
    const leadCheck = await pool.query('SELECT id FROM leads WHERE id = $1', [id]);
    if (leadCheck.rows.length > 0) {
        return { id, status: 'Active', type: 'LEAD' };
    }

    return null;
};

const deleteCustomer = async (id) => {
    // Remove customer from the system
    // First try deleting from users
    const userResult = await pool.query(`DELETE FROM users WHERE id = $1 AND role = 'user' RETURNING id`);
    if (userResult.rows.length > 0) return userResult.rows[0];

    // Then try deleting from leads (using the complex lead deletion logic if possible, 
    // but here we do a direct delete for simplicity as this is a customer-focused view)
    const leadResult = await pool.query(`DELETE FROM leads WHERE id = $1 RETURNING id`);
    return leadResult.rows[0];
};

const getCustomerById = async (id) => {
    // Check users table first
    const userQuery = `
        SELECT 
            u.id, 
            COALESCE(NULLIF(u.full_name, ''), NULLIF(u.phone, ''), 'UNKNOWN USER') as name, 
            u.phone, 
            u.email, 
            u.status, 
            up.pincode,
            up.city,
            up.state,
            'USER' as type
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.id = $1 AND u.role = 'user'
    `;
    const userResult = await pool.query(userQuery, [id]);
    if (userResult.rows.length > 0) {
        return { 
            ...userResult.rows[0], 
            status: userResult.rows[0].status === 'ACTIVE' ? 'Active' : 'Inactive' 
        };
    }

    // Check leads table
    const leadQuery = `
        SELECT 
            id, 
            customer_name as name, 
            customer_phone as phone, 
            customer_email as email, 
            'ACTIVE' as status, 
            pincode,
            city,
            state,
            'LEAD' as type
        FROM leads 
        WHERE id = $1
    `;
    const leadResult = await pool.query(leadQuery, [id]);
    return leadResult.rows[0];
};

module.exports = {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    updateCustomerStatus,
    deleteCustomer
};
