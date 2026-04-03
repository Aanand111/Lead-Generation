const { pool } = require('./src/config/db');

async function checkAdmin() {
    try {
        const res = await pool.query("SELECT phone, password_hash FROM users WHERE role = 'admin'");
        console.log('Admins found:', JSON.stringify(res.rows, null, 2));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAdmin();
