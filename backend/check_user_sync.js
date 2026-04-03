const { pool } = require('./src/config/db');

async function checkUser(phone) {
    try {
        const res = await pool.query("SELECT * FROM users WHERE phone = $1", [phone]);
        if (res.rows.length === 0) {
            console.log('User not found in users table.');
        } else {
            const user = res.rows[0];
            console.log('User found:', JSON.stringify(user, null, 2));
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUser('8787787700');
