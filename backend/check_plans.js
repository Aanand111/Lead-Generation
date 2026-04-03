const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres', host: 'localhost', database: 'LeadDb', password: 'admin', port: 5432,
});

async function checkPlans() {
    try {
        const res = await pool.query("SELECT id, name, category, price, credits, is_active FROM packages");
        console.log('Plans:', JSON.stringify(res.rows));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkPlans();
