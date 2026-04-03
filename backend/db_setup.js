const { pool } = require('./src/config/db');

const categories = ['Real Estate', 'Healthcare', 'Finance', 'Education', 'Festivals'];

async function setup() {
    try {
        console.log('RESETTING POSTER CATEGORIES...');
        await pool.query('TRUNCATE poster_categories RESTART IDENTITY CASCADE');
        for (const cat of categories) {
            await pool.query('INSERT INTO poster_categories (name) VALUES ($1)', [cat]);
            console.log(`Added: ${cat}`);
        }
        console.log('SUCCESS');
        process.exit();
    } catch (err) {
        console.error('ERROR:', err.message);
        process.exit(1);
    }
}

setup();
