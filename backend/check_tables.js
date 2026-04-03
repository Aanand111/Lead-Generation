const { pool } = require('./src/config/db');

async function checkCounts() {
    try {
        const vCount = await pool.query('SELECT COUNT(1) FROM vendors');
        const uCount = await pool.query("SELECT COUNT(1) FROM users WHERE role = 'vendor'");
        console.log('Vendors table count:', vCount.rows[0].count);
        console.log('Users table (vendor role) count:', uCount.rows[0].count);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCounts();
