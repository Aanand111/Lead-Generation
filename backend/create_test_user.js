const { pool } = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function createTestUser() {
    try {
        const hash = await bcrypt.hash('testpass', 10);
        await pool.query(
            "INSERT INTO users (phone, password_hash, role, status) VALUES ('1234567890', $1, 'user', 'ACTIVE') ON CONFLICT (phone) DO UPDATE SET password_hash = $1, status = 'ACTIVE'",
            [hash]
        );
        console.log('Test user (1234567890/testpass) ready.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

createTestUser();
