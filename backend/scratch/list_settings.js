const { pool } = require('../config/db');

async function listSettings() {
    try {
        const res = await pool.query('SELECT * FROM system_settings');
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listSettings();
