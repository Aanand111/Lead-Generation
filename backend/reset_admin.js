const { pool } = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function resetAdmin() {
    try {
        const hash = await bcrypt.hash('admin123', 10);
        await pool.query("UPDATE users SET password_hash = $1 WHERE phone = '1234567890'", [hash]);
        console.log('Admin password updated to: admin123');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

resetAdmin();
