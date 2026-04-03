require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function checkSubVendors() {
    try {
        console.log('--- ALL VENDORS ---');
        const resV = await pool.query('SELECT id, name FROM vendors WHERE referred_by_vendor_id IS NULL');
        console.log(JSON.stringify(resV.rows, null, 2));

        console.log('\n--- ALL SUB-VENDORS ---');
        const resS = await pool.query('SELECT id, name, referred_by_vendor_id FROM vendors WHERE referred_by_vendor_id IS NOT NULL');
        console.log(JSON.stringify(resS.rows, null, 2));

        console.log('\n--- JOINED COUNT ---');
        const resJ = await pool.query(`
            SELECT referred_by_vendor_id, COUNT(*) as count 
            FROM vendors 
            WHERE referred_by_vendor_id IS NOT NULL
            GROUP BY referred_by_vendor_id
        `);
        console.log(JSON.stringify(resJ.rows, null, 2));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkSubVendors();
