require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function checkLeads() {
    try {
        const res = await pool.query('SELECT COUNT(*) FROM leads');
        console.log('Total Leads:', res.rows[0].count);
        const leads = await pool.query('SELECT * FROM leads LIMIT 5');
        console.log('Sample Leads:', leads.rows);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkLeads();
