const { pool } = require('../config/db');

const createLeadCategory = async (name, status = 'Active') => {
    const result = await pool.query(
        `INSERT INTO lead_categories (name, status, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *`,
        [name, status]
    );
    return result.rows[0];
};

const getLeadCategories = async () => {
    const result = await pool.query(`SELECT * FROM lead_categories ORDER BY id ASC`);
    return result.rows;
};

const updateLeadCategory = async (id, name, status) => {
    const result = await pool.query(
        `UPDATE lead_categories SET name = $1, status = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
        [name, status, id]
    );
    return result.rows[0];
};

const deleteLeadCategory = async (id) => {
    const result = await pool.query(`DELETE FROM lead_categories WHERE id = $1 RETURNING id`, [id]);
    return result.rows[0];
};

module.exports = {
    createLeadCategory,
    getLeadCategories,
    updateLeadCategory,
    deleteLeadCategory
};
