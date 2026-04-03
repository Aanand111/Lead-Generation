require('dotenv').config();
const { pool } = require('./src/config/db');

(async () => {
    try {
        await pool.query('ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_assigned_to_fkey');
        console.log('Constraint dropped successfully.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
