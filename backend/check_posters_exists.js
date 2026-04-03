const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres', host: 'localhost', database: 'LeadDb', password: 'admin', port: 5432,
});

async function checkPosters() {
    try {
        const res = await pool.query("SELECT * FROM posters LIMIT 1");
        console.log('Posters Columns:', Object.keys(res.rows[0] || {}).join(', '));
    } catch (err) {
        console.error('ERROR_POSTERS:', err.message);
    } finally {
        await pool.end();
    }
}

checkPosters();
