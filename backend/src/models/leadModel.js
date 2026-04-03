const { pool } = require('../config/db');

const createLead = async (leadData, adminId) => {
    const { lead_id, customer_name, customer_phone, customer_email, category, city, state, pincode, lead_value, expiry_date } = leadData;
    const result = await pool.query(
        `INSERT INTO leads (lead_id, customer_name, customer_phone, customer_email, category, city, state, pincode, lead_value, expiry_date, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [lead_id, customer_name, customer_phone, customer_email, category, city, state, pincode, lead_value, expiry_date, adminId]
    );
    return result.rows[0];
};

const editLead = async (id, leadData) => {
    const { lead_id, customer_name, customer_phone, customer_email, category, city, state, pincode, lead_value, expiry_date } = leadData;
    const result = await pool.query(
        `UPDATE leads SET lead_id = $1, customer_name = $2, customer_phone = $3, customer_email = $4, category = $5, city = $6, state = $7, pincode = $8, lead_value = $9, expiry_date = $10
         WHERE id = $11 RETURNING *`,
        [lead_id, customer_name, customer_phone, customer_email, category, city, state, pincode, lead_value, expiry_date, id]
    );
    return result.rows[0];
};

const getAllLeads = async (page = 1, limit = 10, search = '') => {
    const offset = (page - 1) * limit;
    let queryStr = `SELECT * FROM leads WHERE 1=1`;
    const queryParams = [];

    if (search) {
        queryStr += ` AND (lead_id ILIKE $${queryParams.length + 1} OR customer_name ILIKE $${queryParams.length + 1} OR customer_phone ILIKE $${queryParams.length + 1} OR city ILIKE $${queryParams.length + 1} OR pincode ILIKE $${queryParams.length + 1})`;
        queryParams.push(`%${search}%`);
    }

    queryStr += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(queryStr, queryParams);

    // Total count
    let countQueryStr = `SELECT COUNT(*) FROM leads WHERE 1=1`;
    const countParams = [];
    if (search) {
        countQueryStr += ` AND (lead_id ILIKE $${countParams.length + 1} OR customer_name ILIKE $${countParams.length + 1} OR customer_phone ILIKE $${countParams.length + 1} OR city ILIKE $${countParams.length + 1} OR pincode ILIKE $${countParams.length + 1})`;
        countParams.push(`%${search}%`);
    }
    const countResult = await pool.query(countQueryStr, countParams);

    return { leads: result.rows, total: parseInt(countResult.rows[0].count) };
};

const deleteLead = async (leadId) => {
    const result = await pool.query(`DELETE FROM leads WHERE id = $1 RETURNING id`, [leadId]);
    return result.rows[0];
}

const getPurchasedLeads = async (page = 1, limit = 10, search = '') => {
    const offset = (page - 1) * limit;

    let queryStr = `
        SELECT 
            lp.id, 
            COALESCE(u.full_name, lp.customer_name, u.phone) as customer_name,
            COALESCE(lp.lead_id, lp.id) as lead_id,
            p.name as package_name,
            COALESCE(l.customer_name, lp.lead_name) as lead_name,
            COALESCE(p.lead_limit, (lp.total_leads)::int) as total_leads,
            COALESCE(up.leads_remaining, (lp.remaing_leads)::int) as remaining_leads,
            lp.lead_price as price,
            lp.purchase_date as starting_date,
            lp.expiry_date as end_date
        FROM lead_purchases lp
        LEFT JOIN users u ON lp.user_id = u.id
        LEFT JOIN leads l ON lp.lead_id = l.id
        LEFT JOIN (
            SELECT DISTINCT ON (user_id) user_id, package_id, leads_remaining, status
            FROM user_packages
            ORDER BY user_id, purchase_date DESC
        ) up ON up.user_id = u.id AND up.status = 'ACTIVE'
        LEFT JOIN packages p ON up.package_id = p.id
        WHERE 1=1
    `;
    const queryParams = [];

    if (search) {
        queryStr += ` AND (u.full_name ILIKE $${queryParams.length + 1} OR lp.customer_name ILIKE $${queryParams.length + 1} OR l.customer_name ILIKE $${queryParams.length + 1} OR lp.lead_name ILIKE $${queryParams.length + 1} OR p.name ILIKE $${queryParams.length + 1})`;
        queryParams.push(`%${search}%`);
    }

    queryStr += ` ORDER BY lp.purchase_date DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(queryStr, queryParams);

    let countQueryStr = `
        SELECT COUNT(*)
        FROM lead_purchases lp
        LEFT JOIN users u ON lp.user_id = u.id
        LEFT JOIN leads l ON lp.lead_id = l.id
        LEFT JOIN (
            SELECT DISTINCT ON (user_id) user_id, package_id, status
            FROM user_packages
            ORDER BY user_id, purchase_date DESC
        ) up ON up.user_id = u.id AND up.status = 'ACTIVE'
        LEFT JOIN packages p ON up.package_id = p.id
        WHERE 1=1
    `;
    const countParams = [];
    if (search) {
        countQueryStr += ` AND (u.full_name ILIKE $${countParams.length + 1} OR lp.customer_name ILIKE $${countParams.length + 1} OR l.customer_name ILIKE $${countParams.length + 1} OR lp.lead_name ILIKE $${countParams.length + 1} OR p.name ILIKE $${countParams.length + 1})`;
        countParams.push(`%${search}%`);
    }
    const countResult = await pool.query(countQueryStr, countParams);

    return { purchasedLeads: result.rows, total: parseInt(countResult.rows[0].count) };
};

module.exports = {
    createLead,
    editLead,
    getAllLeads,
    deleteLead,
    getPurchasedLeads
};
