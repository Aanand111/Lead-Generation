const { pool } = require('./src/config/db');
const fs = require('fs');

async function findNirmal() {
    try {
        const res = await pool.query("SELECT id, full_name, role, email, phone, referred_by FROM users WHERE full_name ILIKE '%nirmal%'");
        fs.writeFileSync('nirmal_check.json', JSON.stringify(res.rows, null, 2));
        console.log('Found', res.rows.length, 'users');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findNirmal();
