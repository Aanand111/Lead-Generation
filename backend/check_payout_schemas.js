require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function checkVendorsSchema() {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'vendors'");
        console.log('Vendors Schema:', JSON.stringify(res.rows, null, 2));
        
        const res2 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'commission_transactions'");
        console.log('Commission Transactions Schema:', JSON.stringify(res2.rows, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkVendorsSchema();
