const { pool } = require('./src/config/db');
async function check() {
    try {
        const res = await pool.query("SELECT * FROM vendors LIMIT 1");
        console.log('Columns:', Object.keys(res.rows[0] || {}));
        console.log('Sample Row:', res.rows[0]);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
check();
