const { pool } = require('./src/config/db');
require('dotenv').config();

async function testPartialQuery() {
    try {
        const query = `
            SELECT t.id FROM transactions t
            LEFT JOIN users u ON u.id = t.user_id
            -- LEFT JOIN customers c ON c.id = t.user_id
            LIMIT 1
        `;
        await pool.query(query);
        console.log('Query without customers worked!');
        process.exit(0);
    } catch (err) {
        console.error('Query WITHOUT customers ALSO FAILED!');
        console.error(err);
        process.exit(1);
    }
}
testPartialQuery();
