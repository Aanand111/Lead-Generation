require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function checkAll() {
    try {
        const tablesRes = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
        const tables = tablesRes.rows.map(r => r.table_name);
        console.log('Tables:', tables);

        const subscriptionsTable = tables.includes('subscriptions');
        console.log('subscriptions table exists:', subscriptionsTable);

        const rLeadsRes = await pool.query("SELECT COUNT(*) FROM leads");
        console.log('Leads count:', rLeadsRes.rows[0].count);

        const rPurchasesRes = await pool.query("SELECT COUNT(*) FROM lead_purchases");
        console.log('Lead purchases count:', rPurchasesRes.rows[0].count);

        const usersRes = await pool.query("SELECT id, phone, role, wallet_balance FROM users LIMIT 10");
        console.log('Users (up to 10):', JSON.stringify(usersRes.rows, null, 2));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkAll();
