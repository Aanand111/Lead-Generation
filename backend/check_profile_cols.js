const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres', host: 'localhost', database: 'LeadDb', password: 'admin', port: 5432,
});

async function checkProfileCols() {
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'user_profiles'");
        console.log('Columns in user_profiles:', res.rows.map(r => r.column_name).join(', '));
    } catch (err) {
        console.error('ERROR_COLS:', err.message);
    } finally {
        await pool.end();
    }
}

checkProfileCols();
