const { pool } = require('./src/config/db');
require('dotenv').config();

async function checkOrphans() {
    try {
        const total = await pool.query('SELECT COUNT(*) FROM transactions');
        console.log('Total Transactions:', total.rows[0].count);

        const joined = await pool.query(`
            SELECT COUNT(*) 
            FROM transactions t
            LEFT JOIN users u ON u.id = t.user_id
            LEFT JOIN customers c ON c.id = t.user_id
            WHERE u.id IS NOT NULL OR c.id IS NOT NULL
        `);
        console.log('Transactions with valid User/Customer:', joined.rows[0].count);

        const orphans = await pool.query(`
            SELECT t.id, t.user_id, t.type, t.amount 
            FROM transactions t
            LEFT JOIN users u ON u.id = t.user_id
            LEFT JOIN customers c ON c.id = t.user_id
            WHERE u.id IS NULL AND c.id IS NULL
            LIMIT 10
        `);
        console.log('Orphan Transactions (No User/Customer match):', orphans.rows.length);
        if (orphans.rows.length > 0) {
            console.log('Sample orphans:', JSON.stringify(orphans.rows, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkOrphans();
