const { pool } = require('./src/config/db');
require('dotenv').config();

async function debugQuery() {
    try {
        const query = `
            SELECT n.*, c.name as category_name
            FROM news n
            LEFT JOIN news_categories c ON n.category_id = c.id
            WHERE n.status = true
            ORDER BY n.created_at DESC
        `;
        const res = await pool.query(query);
        console.log('SUCCESS:', res.rows.length, 'rows');
        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err.message);
        console.error('STACK:', err.stack);
        process.exit(1);
    }
}

debugQuery();
