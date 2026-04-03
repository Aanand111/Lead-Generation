const { pool } = require('./src/config/db');

async function testNews() {
    try {
        console.log('Testing access to "news" table...');
        const res = await pool.query('SELECT COUNT(*) FROM news');
        console.log('Count:', res.rows[0].count);
        
        console.log('Testing access to "available_leads" table...');
        const res2 = await pool.query('SELECT COUNT(*) FROM available_leads');
        console.log('Count:', res2.rows[0].count);
        
    } catch (err) {
        console.error('Test failed:', err.message);
    } finally {
        await pool.end();
    }
}

testNews();
