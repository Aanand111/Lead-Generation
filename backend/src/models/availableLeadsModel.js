const { pool } = require('../config/db');

const getAvailableLeads = async () => {
    const query = `
        SELECT 
            COALESCE(l.id::text, av.id::text) as id,
            COALESCE(l.lead_id, av.lead_uid) as lead_id,
            COALESCE(l.customer_name, av.name) as customer_name,
            COALESCE(l.customer_phone, av.phone) as customer_phone,
            COALESCE(l.customer_email, av.email) as customer_email,
            COALESCE(l.category, lc.name) as category,
            COALESCE(l.city, av.city) as city,
            COALESCE(l.state, av.state) as state,
            COALESCE(l.pincode, '') as pincode,
            l.lead_value,
            l.expiry_date,
            l.created_by,
            COALESCE(l.created_at, av.created_at) as created_at,
            COALESCE(l.assigned_to::text, av.assigned_to::text) as assigned_to,
            COALESCE(l.assigned_at, av.assigned_at) as assigned_at,
            COALESCE(l.assignment_status, 'UNASSIGNED') as assignment_status,
            COALESCE(l.status, av.status, 'ACTIVE') as status,
            COALESCE(av.name, l.customer_name) AS name,
            COALESCE(av.lead_uid, l.lead_id) AS lead_uid,
            av.source AS source,
            COALESCE(lc.name, l.category) AS category_name,
            COALESCE(av.city, l.city) AS city_display,
            COALESCE(av.state, l.state) AS state_display,
            av.phone AS av_phone,
            av.email AS av_email,
            av.priority AS priority,
            av.notes AS notes,
            av.address AS address
        FROM leads l
        FULL OUTER JOIN available_leads av ON l.lead_id = av.lead_uid
        LEFT JOIN lead_categories lc ON av.category_id = lc.id
        WHERE COALESCE(l.assignment_status, 'UNASSIGNED') = 'UNASSIGNED'
        AND COALESCE(l.status, 'ACTIVE') IN ('ACTIVE', 'PENDING')
        ORDER BY COALESCE(l.created_at, av.created_at) DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

/**
 * Smart Lead Assignment Logic
 */
const findBestMatchesForLead = async (leadId) => {
    const leadRes = await pool.query(`SELECT category, pincode FROM leads WHERE id = $1`, [leadId]);
    if (leadRes.rows.length === 0) return [];

    const { category, pincode } = leadRes.rows[0];

    const query = `
        SELECT 
            u.id, 
            u.full_name, 
            u.phone,
            (SELECT COUNT(*) FROM leads WHERE assigned_to = u.id) as current_load,
            (CASE 
                WHEN vp.pincode = $1 AND vc.category_id = (SELECT id FROM lead_categories WHERE name = $2) THEN 10
                WHEN vp.pincode = $1 THEN 5
                WHEN vc.category_id = (SELECT id FROM lead_categories WHERE name = $2) THEN 2
                ELSE 0 
            END) as match_score
        FROM users u
        LEFT JOIN vendor_pincodes vp ON u.id = vp.vendor_id AND vp.is_active = true
        LEFT JOIN vendor_categories vc ON u.id = vc.vendor_id AND vc.is_active = true
        WHERE u.role = 'vendor' AND u.status = 'ACTIVE'
        AND (vp.pincode = $1 OR vc.category_id = (SELECT id FROM lead_categories WHERE name = $2))
        ORDER BY match_score DESC, current_load ASC
        LIMIT 5
    `;
    const result = await pool.query(query, [pincode, category]);
    return result.rows;
};

const assignLeads = async (leadIds, assigneeType, assigneeId) => {
    const query = `
        UPDATE leads
        SET assigned_to = $1, assigned_at = NOW(), assignment_status = 'ASSIGNED'
        WHERE id = ANY($2::uuid[])
        RETURNING *
    `;
    const result = await pool.query(query, [assigneeId, leadIds]);
    return result.rows;
};

module.exports = {
    getAvailableLeads,
    assignLeads,
    findBestMatchesForLead
};
