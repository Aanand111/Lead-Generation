const { pool } = require('./backend/src/config/db');
require('dotenv').config({ path: './backend/.env' });

async function check() {
    try {
        const res = await pool.query("SELECT * FROM available_leads LIMIT 1");
        console.log("Columns:", Object.keys(res.rows[0]));
        console.log("Data:", res.rows[0]);
    } catch (e) {
        console.log("Error:", e.message);
    } finally {
        await pool.end();
    }
}
check();
