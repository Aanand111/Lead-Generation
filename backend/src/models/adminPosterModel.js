const { pool } = require('../config/db');

const createPoster = async (title, thumbnail, category_id, language, is_premium, status, layoutConfig, duration_days) => {
    const result = await pool.query(
        `INSERT INTO posters (title, thumbnail, category_id, language, is_premium, status, layout_config, duration_days, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *`,
        [title, thumbnail, category_id, language, is_premium, status, JSON.stringify(layoutConfig), duration_days || 30]
    );
    return result.rows[0];
};

const getPosters = async () => {
    const result = await pool.query(
        `SELECT p.*, c.name as category_name 
         FROM posters p 
         LEFT JOIN poster_categories c ON p.category_id = c.id 
         ORDER BY p.created_at DESC`
    );
    return result.rows;
};

const updatePoster = async (id, title, thumbnail, category_id, language, is_premium, status, layoutConfig, duration_days) => {
    let query = `UPDATE posters SET title = $1, category_id = $2, language = $3, is_premium = $4, status = $5, layout_config = $6, duration_days = $7, updated_at = NOW()`;
    let params = [title, category_id, language, is_premium, status, JSON.stringify(layoutConfig), duration_days || 30];
    
    if (thumbnail) {
        query += `, thumbnail = $8 WHERE id = $9 RETURNING *`;
        params.push(thumbnail, id);
    } else {
        query += ` WHERE id = $8 RETURNING *`;
        params.push(id);
    }

    const result = await pool.query(query, params);
    return result.rows[0];
};

const deletePoster = async (id) => {
    const result = await pool.query(`DELETE FROM posters WHERE id = $1 RETURNING id`, [id]);
    return result.rows[0];
};

module.exports = {
    createPoster,
    getPosters,
    updatePoster,
    deletePoster
};
