const { pool } = require('./src/config/db');
require('dotenv').config();

async function inspectSchema() {
    try {
        const leadsSchema = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'leads'
        `);
        console.log('Leads columns:');
        leadsSchema.rows.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
inspectSchema();
