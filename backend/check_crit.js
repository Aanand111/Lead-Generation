const { pool } = require('./src/config/db');
require('dotenv').config();

async function checkCrit() {
    try {
        const u = await pool.query("SELECT 1 FROM users LIMIT 1").catch(e => ({error: e.code}));
        const v = await pool.query("SELECT 1 FROM vendors LIMIT 1").catch(e => ({error: e.code}));
        console.log('Users:', u.error ? 'MISSING' : 'OK');
        console.log('Vendors:', v.error ? 'MISSING' : 'OK');
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}
checkCrit();
