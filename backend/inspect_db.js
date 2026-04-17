const { pool } = require('./src/config/db');
require('dotenv').config();

async function inspectSchema() {
    try {
        const transSchema = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'transactions'
        `);
        console.log('Transactions columns:');
        transSchema.rows.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));

        const userSchema = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        console.log('\nUsers columns:');
        userSchema.rows.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
inspectSchema();
