iconst { pool } = require('./src/config/db');
require('dotenv').config();

async function debugQuery() {
    try {
        const query = `
            SELECT 
                t.*,
                COALESCE(u.full_name, c.name, u.phone, c.phone, c.email, 'User') AS display_name,
                u.full_name AS user_name,
                u.phone     AS user_phone,
                c.name      AS customer_name,
                c.phone     AS customer_phone,
                c.email     AS customer_email,
                sp.name     AS plan_name,
                p.name      AS package_name
            FROM transactions t
            LEFT JOIN users u ON u.id::text = t.user_id::text
            LEFT JOIN customers c ON c.id::text = t.user_id::text
            LEFT JOIN subscription_plans sp ON sp.id::text = t.reference_id
            LEFT JOIN packages p ON p.id::text = t.reference_id
            ORDER BY t.created_at DESC
        `;
        const result = await pool.query(query);
        console.log('Query successful. Rows:', result.rows.length);
        process.exit(0);
    } catch (err) {
        console.error('QUERY FAILED!');
        console.error(err);
        process.exit(1);
    }
}
debugQuery();
