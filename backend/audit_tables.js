const { pool } = require('./src/config/db');
require('dotenv').config();

async function checkCommonTables() {
    try {
        const tables = ['users', 'vendors', 'customers', 'leads', 'transactions'];
        for (const table of tables) {
            try {
                await pool.query(`SELECT 1 FROM ${table} LIMIT 1`);
                console.log(`Table '${table}' EXISTS.`);
            } catch (e) {
                console.log(`Table '${table}' MISSING! (${e.code})`);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkCommonTables();
