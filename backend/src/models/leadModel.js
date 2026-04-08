const { pool } = require('../config/db');

const createLead = async (leadData, adminId, status = 'PENDING') => {
    const { lead_id, customer_name, customer_phone, customer_email, category, city, state, pincode, lead_value, expiry_date } = leadData;
    const result = await pool.query(
        `INSERT INTO leads (lead_id, customer_name, customer_phone, customer_email, category, city, state, pincode, lead_value, expiry_date, created_by, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [lead_id, customer_name, customer_phone, customer_email, category, city, state, pincode, lead_value, expiry_date, adminId, status]
    );
    return result.rows[0];
};

const editLead = async (id, leadData) => {
    const fields = [];
    const params = [];
    let i = 1;

    for (const [key, value] of Object.entries(leadData)) {
        if (value !== undefined) {
            fields.push(`${key} = $${i}`);
            params.push(value);
            i++;
        }
    }

    if (fields.length === 0) return null;

    const query = `UPDATE leads SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`;
    params.push(id);

    const result = await pool.query(query, params);
    return result.rows[0];
};

const getAllLeads = async (page = 1, limit = 10, search = '', status = '') => {
    const offset = (page - 1) * limit;

    // Joint query to get creator info and check roles
    let queryStr = `
        SELECT l.*, u.full_name as created_by_name, u.phone as created_by_phone, u.email as created_by_email, u.role as creator_role 
        FROM leads l
        LEFT JOIN users u ON l.created_by = u.id
        WHERE 1=1
    `;
    const queryParams = [];

    if (search) {
        queryStr += ` AND (l.lead_id ILIKE $${queryParams.length + 1} OR l.customer_name ILIKE $${queryParams.length + 1} OR l.customer_phone ILIKE $${queryParams.length + 1} OR l.city ILIKE $${queryParams.length + 1} OR l.pincode ILIKE $${queryParams.length + 1})`;
        queryParams.push(`%${search}%`);
    }

    if (status) {
        queryStr += ` AND l.status = $${queryParams.length + 1}`;
        queryParams.push(status);

        if (status === 'PENDING') {
            queryStr += ` AND u.role = 'vendor'`;
        }
    }

    queryStr += ` ORDER BY l.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(queryStr, queryParams);

    // Total count with same filters
    let countQueryStr = `
        SELECT COUNT(*) 
        FROM leads l
        LEFT JOIN users u ON l.created_by = u.id
        WHERE 1=1
    `;
    const countParams = [];
    if (search) {
        countQueryStr += ` AND (l.lead_id ILIKE $${countParams.length + 1} OR l.customer_name ILIKE $${countParams.length + 1} OR l.customer_phone ILIKE $${countParams.length + 1} OR l.city ILIKE $${countParams.length + 1} OR l.pincode ILIKE $${countParams.length + 1})`;
        countParams.push(`%${search}%`);
    }
    if (status) {
        countQueryStr += ` AND l.status = $${countParams.length + 1}`;
        countParams.push(status);
        if (status === 'PENDING') {
            countQueryStr += ` AND u.role = 'vendor'`;
        }
    }
    const countResult = await pool.query(countQueryStr, countParams);

    return { leads: result.rows, total: parseInt(countResult.rows[0].count) };
};

const deleteLead = async (leadId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Lead की ID निकालकर जुड़े हुए सभी रिकॉर्ड्स को डिलीट करें
        const leadRes = await client.query('SELECT lead_id FROM leads WHERE id = $1', [leadId]);
        if (leadRes.rows.length > 0) {
            const leadStrId = leadRes.rows[0].lead_id;
            
            // Delete from lead_history using lead_purchase_id
            await client.query(`
                DELETE FROM lead_history 
                WHERE lead_purchase_id IN (SELECT id FROM lead_purchases WHERE lead_id = $1)
            `, [leadId]);

            await client.query('DELETE FROM lead_purchases WHERE lead_id = $1', [leadId]);
            await client.query('DELETE FROM lead_feedback WHERE lead_id = $1', [leadId]);
            await client.query('DELETE FROM available_leads WHERE lead_uid = $1', [leadStrId]);
        } else {
            await client.query('DELETE FROM available_leads WHERE id = $1', [leadId]);
        }

        const result = await client.query(`DELETE FROM leads WHERE id = $1 RETURNING id`, [leadId]);
        await client.query('COMMIT');
        return result.rows[0] || { id: leadId };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
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

const getLeadById = async (id) => {
    const query = `
        SELECT l.*, u.full_name as created_by_name, u.phone as created_by_phone, u.email as created_by_email, u.role as creator_role 
        FROM leads l
        LEFT JOIN users u ON l.created_by = u.id
        WHERE l.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

module.exports = {
    createLead,
    editLead,
    getAllLeads,
    deleteLead,
    getPurchasedLeads,
    getLeadById
};
