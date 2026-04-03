const { pool } = require('../config/db');

const createNews = async (title, content, image, category_id, publish_date, status, is_push_notification, created_by) => {
    const result = await pool.query(
        `INSERT INTO news (title, content, image, category_id, publish_date, status, is_push_notification, created_by, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *`,
        [title, content, image, category_id, publish_date, status, is_push_notification, created_by]
    );
    return result.rows[0];
};

const getNewsList = async () => {
    const result = await pool.query(
        `SELECT n.*, c.name as category_name 
         FROM news n 
         LEFT JOIN news_categories c ON n.category_id = c.id 
         ORDER BY n.created_at DESC`
    );
    return result.rows;
};

const updateNews = async (id, title, content, image, category_id, publish_date, status, is_push_notification) => {
    let query = `UPDATE news SET title = $1, content = $2, category_id = $3, publish_date = $4, status = $5, is_push_notification = $6, updated_at = NOW()`;
    let params = [title, content, category_id, publish_date, status, is_push_notification];
    
    if (image) {
        query += `, image = $7 WHERE id = $8 RETURNING *`;
        params.push(image, id);
    } else {
        query += ` WHERE id = $7 RETURNING *`;
        params.push(id);
    }

    const result = await pool.query(query, params);
    return result.rows[0];
};

const deleteNews = async (id) => {
    const result = await pool.query(`DELETE FROM news WHERE id = $1 RETURNING id`, [id]);
    return result.rows[0];
};

module.exports = {
    createNews,
    getNewsList,
    updateNews,
    deleteNews
};
