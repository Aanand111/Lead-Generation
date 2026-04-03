require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT,
});

async function checkNullLeads() {
    try {
        const res = await pool.query("SELECT COUNT(*) FROM leads WHERE lead_id IS NULL OR lead_id = ''");
        console.log('Null Lead IDs:', res.rows[0].count);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkNullLeads();
