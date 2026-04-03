require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

async function check() {
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'subscription_plans'");
        console.log('subscription_plans columns:', res.rows.map(r => r.column_name));
        
        const res2 = await pool.query('SELECT * FROM subscription_plans LIMIT 1');
        console.log('Sample Row:', res2.rows[0]);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
check();
