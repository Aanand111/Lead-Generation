require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT,
});

async function checkUser() {
    try {
        const id = '4f117792-7efc-4056-84b5-69d5d47c46dc';
        const res = await pool.query("SELECT phone, wallet_balance FROM users WHERE id=$1", [id]);
        console.log(JSON.stringify(res.rows, null, 2));

        const lp = await pool.query("SELECT COUNT(*) FROM lead_purchases WHERE user_id=$1", [id]);
        console.log('Lead purchases count:', lp.rows[0].count);

    } catch (err) { console.error(err); } finally { await pool.end(); }
}
checkUser();
