const { pool } = require('./src/config/db');
require('dotenv').config();

async function check() {
    try {
        const res = await pool.query("SELECT * FROM available_leads LIMIT 1");
        console.log("COLUMNS_JSON:", JSON.stringify(Object.keys(res.rows[0])));
        console.log("FIRST_ROW_DATA:", JSON.stringify(res.rows[0], null, 2));
    } catch (e) {
        console.log("Error:", e.message);
    } finally {
        await pool.end();
    }
}
check();
