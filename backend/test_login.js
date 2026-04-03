const { pool } = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function testLogin(phone, password) {
    try {
        const res = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
        if (res.rows.length === 0) {
            console.log('User not found');
            process.exit();
        }
        const user = res.rows[0];
        console.log('User found:', user.phone);
        console.log('Stored hash:', user.password_hash);
        const match = await bcrypt.compare(password, user.password_hash);
        console.log('Password match:', match);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

// Pass phone and password as args
testLogin(process.argv[2], process.argv[3]);
