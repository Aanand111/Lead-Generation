const { pool } = require('../config/db');

const getAvailableLeads = async () => {
    const query = `
        SELECT 
            l.*
        FROM leads l
        WHERE l.assignment_status = 'UNASSIGNED'
        ORDER BY l.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

/**
 * Smart Lead Assignment Logic (Logic for "predefined rules like location, lead type, or availability of vendor credits.")
 * 1. Find all vendors whose operating pincodes match the lead's pincode.
 * 2. Find all vendors whose operating categories match the lead's category.
 * 3. Match both criteria for highest priority, or fallback to one.
 * 4. Filter by availability (wallet balance or activity).
 */
const findBestMatchesForLead = async (leadId) => {
    // Lead info (category, pincode)
    const leadRes = await pool.query(`SELECT category, pincode FROM leads WHERE id = $1`, [leadId]);
    if (leadRes.rows.length === 0) return [];
    
    const { category, pincode } = leadRes.rows[0];

    // Query vendors that match category, pincode or both
    const query = `
        SELECT 
            u.id, 
            u.full_name, 
            u.phone,
            (SELECT COUNT(*) FROM leads WHERE assigned_to = u.id) as current_load,
            (CASE 
                WHEN vp.pincode = $1 AND vc.category_id = (SELECT id FROM lead_categories WHERE name = $2) THEN 10 -- Both match
                WHEN vp.pincode = $1 THEN 5 -- Pincode match
                WHEN vc.category_id = (SELECT id FROM lead_categories WHERE name = $2) THEN 2 -- Category match
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
