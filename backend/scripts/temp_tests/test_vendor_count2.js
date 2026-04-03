require('dotenv').config();
const { pool } = require('./src/config/db');

async function check() {
    try {
        const res = await pool.query("SELECT id, name, referred_by_vendor_id FROM vendors WHERE referred_by_vendor_id IS NULL");
        console.log('MAIN VENDORS:', res.rows.length);
        
        const res2 = await pool.query("SELECT id, name, referred_by_vendor_id FROM vendors WHERE referred_by_vendor_id IS NOT NULL");
        console.log('SUB VENDORS:', res2.rows.length);
        
        const res3 = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'vendor'");
        console.log('USERS ROLE VENDOR:', res3.rows[0].count);
    } catch (e) {
        console.log('ERROR:', e.message);
    } finally {
        await pool.end();
    }
}
check();
