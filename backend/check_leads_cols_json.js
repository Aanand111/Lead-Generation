const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres', host: 'localhost', database: 'LeadDb', password: 'admin', port: 5432,
});

async function checkLeadsCols() {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='leads'");
        console.log('Columns:', JSON.stringify(res.rows));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkLeadsCols();
