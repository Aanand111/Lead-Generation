require('dotenv').config();
const { pool } = require('./src/config/db');

async function check() {
    try {
        const res = await pool.query("SELECT id, name, referred_by_vendor_id FROM vendors");
        console.log('VENDORS:', res.rows);
        console.log('TOTAL:', res.rows.length);
    } catch (e) {
        console.log('ERROR:', e.message);
    } finally {
        await pool.end();
    }
}
check();
