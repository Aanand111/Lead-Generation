const { pool } = require('../config/db');

const getAvailableLeads = async (page = 1, limit = 10, search = '') => {
    const offset = (page - 1) * limit;
    const normalizedSearch = typeof search === 'string' ? search.trim() : '';
    const searchPattern = normalizedSearch ? `%${normalizedSearch}%` : null;

    const query = `
        WITH combined_leads AS (
            SELECT
                l.id::text AS id,
                l.lead_id AS lead_id,
                COALESCE(l.customer_name, av.name) AS customer_name,
                COALESCE(l.customer_phone, av.phone) AS customer_phone,
                COALESCE(l.customer_email, av.email) AS customer_email,
                COALESCE(l.category, lc.name) AS category,
                COALESCE(l.city, av.city) AS city,
                COALESCE(l.state, av.state) AS state,
                COALESCE(l.pincode, '') AS pincode,
                l.lead_value,
                l.expiry_date,
                l.created_by,
                COALESCE(l.created_at, av.created_at) AS created_at,
                l.assigned_to::text AS assigned_to,
                l.assigned_at,
                COALESCE(l.assignment_status, 'UNASSIGNED') AS assignment_status,
                COALESCE(l.status, av.status, 'ACTIVE') AS status,
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
            LEFT JOIN available_leads av ON av.lead_uid = l.lead_id
            LEFT JOIN lead_categories lc ON lc.id = av.category_id
            WHERE COALESCE(l.assignment_status, 'UNASSIGNED') = 'UNASSIGNED'
              AND COALESCE(l.status, 'ACTIVE') IN ('ACTIVE', 'PENDING')

            UNION ALL

            SELECT
                av.id::text AS id,
                av.lead_uid AS lead_id,
                av.name AS customer_name,
                av.phone AS customer_phone,
                av.email AS customer_email,
                lc.name AS category,
                av.city AS city,
                av.state AS state,
                '' AS pincode,
                NULL::numeric AS lead_value,
                NULL::timestamp AS expiry_date,
                NULL::uuid AS created_by,
                av.created_at AS created_at,
                av.assigned_to::text AS assigned_to,
                av.assigned_at AS assigned_at,
                'UNASSIGNED' AS assignment_status,
                COALESCE(av.status, 'ACTIVE') AS status,
                av.name AS name,
                av.lead_uid AS lead_uid,
                av.source AS source,
                lc.name AS category_name,
                av.city AS city_display,
                av.state AS state_display,
                av.phone AS av_phone,
                av.email AS av_email,
                av.priority AS priority,
                av.notes AS notes,
                av.address AS address
            FROM available_leads av
            LEFT JOIN leads l ON l.lead_id = av.lead_uid
            LEFT JOIN lead_categories lc ON lc.id = av.category_id
            WHERE l.id IS NULL
        ),
        filtered_leads AS (
            SELECT *
            FROM combined_leads
            WHERE $3::text IS NULL
               OR customer_name ILIKE $3
               OR customer_phone ILIKE $3
               OR customer_email ILIKE $3
               OR name ILIKE $3
               OR av_phone ILIKE $3
               OR av_email ILIKE $3
               OR city ILIKE $3
               OR city_display ILIKE $3
               OR state ILIKE $3
               OR state_display ILIKE $3
               OR lead_id ILIKE $3
               OR COALESCE(category_name, category, '') ILIKE $3
        )
        SELECT *, COUNT(*) OVER() AS total_count
        FROM filtered_leads
        ORDER BY created_at DESC, lead_id DESC
        LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset, searchPattern]);
    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;
    const leads = result.rows.map(({ total_count, ...lead }) => lead);

    return {
        leads,
        total
    };
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
