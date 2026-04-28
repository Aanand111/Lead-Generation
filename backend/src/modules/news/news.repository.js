const { pool } = require('../../config/db');

class NewsRepository {
    async create(newsData) {
        const { title, content, image, type, target_audience, is_push_notification, created_by } = newsData;
        const result = await pool.query(
            `INSERT INTO news (title, content, image, type, target_audience, is_push_notification, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [title, content, image, type, target_audience, is_push_notification, created_by]
        );
        return result.rows[0];
    }

    async findAll(filters) {
        const { target_audience, type } = filters;
        let query = `SELECT * FROM news`;
        const params = [];
        const conditions = [];

        if (target_audience) {
            params.push(target_audience);
            conditions.push(`target_audience = $${params.length}`);
        }
        if (type) {
            params.push(type);
            conditions.push(`type = $${params.length}`);
        }

        if (conditions.length > 0) query += ` WHERE ` + conditions.join(' AND ');
        query += ` ORDER BY created_at DESC`;

        const result = await pool.query(query, params);
        return result.rows;
    }

    async findById(id) {
        const result = await pool.query('SELECT * FROM news WHERE id = $1', [id]);
        return result.rows[0];
    }

    async update(id, newsData) {
        const { title, content, image, type, target_audience, is_push_notification } = newsData;
        const result = await pool.query(
            `UPDATE news SET title = $1, content = $2, image = $3, type = $4, target_audience = $5, 
             is_push_notification = $6, updated_at = NOW() WHERE id = $7 RETURNING *`,
            [title, content, image, type, target_audience, is_push_notification, id]
        );
        return result.rows[0];
    }

    async delete(id) {
        await pool.query('DELETE FROM news WHERE id = $1', [id]);
    }
}

module.exports = new NewsRepository();
