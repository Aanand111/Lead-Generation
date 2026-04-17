const { pool } = require('./src/config/db');

async function cleanupTests() {
    console.log('🧹 Cleaning up 10,000 test users...');
    try {
        const result = await pool.query("DELETE FROM users WHERE email LIKE 'testuser_%@example.com'");
        console.log(`✅ Successfully deleted ${result.rowCount} test users.`);
    } catch (err) {
        console.error('❌ Deletion failed:', err.message);
    } finally {
        process.exit(0);
    }
}

cleanupTests();
