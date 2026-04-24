const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkData() {
    try {
        console.log('--- Checking Users Table ---');
        const users = await pool.query("SELECT id, full_name, email, phone, role, status, referred_by FROM users WHERE full_name ILIKE '%Nirmal%' OR full_name ILIKE '%Viking%' OR role = 'vendor'");
        console.table(users.rows);

        console.log('\n--- Checking Vendors Table ---');
        const vendors = await pool.query("SELECT id, name, email, phone, referred_by_vendor_id FROM vendors");
        console.table(vendors.rows);

        await pool.end();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
