require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT,
});

async function checkConstraints() {
    try {
        const res = await pool.query(`
            SELECT cc.check_clause 
            FROM information_schema.check_constraints cc 
            JOIN information_schema.constraint_column_usage ccu 
            ON cc.constraint_name = ccu.constraint_name 
            WHERE ccu.table_name = 'users' AND ccu.column_name = 'wallet_balance'
        `);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) { console.error(err); } finally { await pool.end(); }
}
checkConstraints();
