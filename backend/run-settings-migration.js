// Quick script to run only the settings migration
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'LeadDb',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
});

const run = async () => {
    const client = await pool.connect();
    try {
        const sql = fs.readFileSync(
            path.join(__dirname, 'src/database/migrations/012_system_settings.sql'),
            'utf-8'
        );
        console.log('Running system_settings migration...');
        await client.query(sql);
        console.log('✅ system_settings table created and seeded successfully.');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        client.release();
        pool.end();
    }
};

run();
