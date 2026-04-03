const { pool } = require('../config/db');

const createNewsCategory = async (name, status = true, created_at = null) => {
    // Assuming status is a boolean in db
    const dateValue = created_at ? created_at : new Date().toISOString();
    const result = await pool.query(
        `INSERT INTO news_categories (name, status, created_at, updated_at) VALUES ($1, $2, $3, NOW()) RETURNING *`,
        [name, status, dateValue]
    );
    return result.rows[0];
};

const getNewsCategories = async () => {
    const result = await pool.query(`SELECT * FROM news_categories ORDER BY created_at DESC`);
    return result.rows;
};

const updateNewsCategory = async (id, name, status, created_at = null) => {
    let result;
    if (created_at) {
        result = await pool.query(
            `UPDATE news_categories SET name = $1, status = $2, created_at = $4, updated_at = NOW() WHERE id = $3 RETURNING *`,
            [name, status, id, created_at]
        );
    } else {
        result = await pool.query(
            `UPDATE news_categories SET name = $1, status = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
            [name, status, id]
        );
    }
    return result.rows[0];
};

const deleteNewsCategory = async (id) => {
    const result = await pool.query(`DELETE FROM news_categories WHERE id = $1 RETURNING id`, [id]);
    return result.rows[0];
};

module.exports = {
    createNewsCategory,
    getNewsCategories,
    updateNewsCategory,
    deleteNewsCategory
};
