const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres', host: 'localhost', database: 'LeadDb', password: 'admin', port: 5432,
});

async function checkRefCols() {
    try {
        console.log('Users ID Type:');
        const userRes = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='users' AND column_name='id'");
        console.log(JSON.stringify(userRes.rows));
        
        console.log('Referrals Table Columns:');
        const refRes = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='referrals'");
        console.log(JSON.stringify(refRes.rows));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkRefCols();
