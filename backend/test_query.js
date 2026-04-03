require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function checkQuery() {
    try {
        const queryStr = `
            SELECT 
                v.id, v.name, 
                COALESCE(r_count.count, 0) as total_referrals
            FROM vendors v
            LEFT JOIN (
                SELECT referred_by_vendor_id, COUNT(*) as count 
                FROM vendors 
                GROUP BY referred_by_vendor_id
            ) r_count ON v.id = r_count.referred_by_vendor_id
            WHERE v.referred_by_vendor_id IS NULL
        `;
        const res = await pool.query(queryStr);
        console.log('Query Result:', JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkQuery();
