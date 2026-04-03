const { pool } = require('./backend/src/config/db');
require('dotenv').config({ path: './backend/.env' });

async function check() {
    try {
        const res = await pool.query("SELECT * FROM available_leads");
        console.log("Total records:", res.rows.length);
        console.log(res.rows);
    } catch (e) {
        console.log("Error:", e.message);
    } finally {
        await pool.end();
    }
}
check();
