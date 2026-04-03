const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres', host: 'localhost', database: 'LeadDb', password: 'admin', port: 5432,
});

async function checkLeadsKeys() {
    try {
        const res = await pool.query("SELECT * FROM leads LIMIT 1");
        if (res.rows[0]) {
            console.log('Columns in Leads:', Object.keys(res.rows[0]).join(', '));
        } else {
            console.log('Leads table is empty!');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkLeadsKeys();
