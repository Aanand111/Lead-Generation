const { pool } = require('./src/config/db');
require('dotenv').config();

async function checkTransactions() {
    try {
        const count = await pool.query('SELECT COUNT(*) FROM transactions');
        console.log('Total transactions in DB:', count.rows[0].count);

        const types = await pool.query('SELECT DISTINCT type FROM transactions');
        console.log('Transaction types:', types.rows.map(r => r.type));

        const statuses = await pool.query('SELECT DISTINCT status FROM transactions');
        console.log('Transaction statuses:', statuses.rows.map(r => r.status));

        const sample = await pool.query('SELECT * FROM transactions LIMIT 5');
        console.log('Sample data:', JSON.stringify(sample.rows, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkTransactions();
