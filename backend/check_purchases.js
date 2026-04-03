require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT,
});

async function checkPurchases() {
    try {
        const res = await pool.query("SELECT * FROM lead_purchases");
        console.log('Purchases:', res.rows.length);
        if (res.rows.length > 0) console.log('Sample:', res.rows[0]);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkPurchases();
