const { pool } = require('./src/config/db');
require('dotenv').config();

async function checkVendors() {
    try {
        const vendorTrans = await pool.query(`
            SELECT t.id, t.user_id, v.name as vendor_name
            FROM transactions t
            JOIN vendors v ON v.id = t.user_id
            LIMIT 5
        `);
        console.log('Transactions linked to Vendors:', vendorTrans.rows.length);
        if (vendorTrans.rows.length > 0) {
            console.log('Sample:', JSON.stringify(vendorTrans.rows, null, 2));
        }

        const customerTrans = await pool.query(`
            SELECT t.id, t.user_id, c.name as customer_name
            FROM transactions t
            JOIN customers c ON c.id = t.user_id
            LIMIT 5
        `);
        console.log('Transactions linked to Customers:', customerTrans.rows.length);

        const userTrans = await pool.query(`
            SELECT t.id, t.user_id, u.full_name
            FROM transactions t
            JOIN users u ON u.id = t.user_id
            LIMIT 5
        `);
        console.log('Transactions linked to Users (Auth):', userTrans.rows.length);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkVendors();
