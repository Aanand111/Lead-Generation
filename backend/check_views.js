require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT,
});

async function checkViews() {
    try {
        const res = await pool.query("SELECT table_name FROM information_schema.views WHERE table_schema='public'");
        console.log('Views:', res.rows.map(r => r.table_name));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkViews();
