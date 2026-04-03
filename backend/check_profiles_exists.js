const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres', host: 'localhost', database: 'LeadDb', password: 'admin', port: 5432,
});

async function checkProfiles() {
    try {
        const res = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles')");
        console.log('USER_PROFILES EXISTS:', res.rows[0].exists);
    } catch (err) {
        console.error('ERROR_PROFILES:', err.message);
    } finally {
        await pool.end();
    }
}

checkProfiles();
