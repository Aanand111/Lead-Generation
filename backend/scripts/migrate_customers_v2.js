const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'leadgen',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

async function migrate() {
    try {
        console.log('Adding missing columns to customers table...');
        
        // Add columns if they don't exist
        await pool.query(`
            ALTER TABLE customers 
            ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20),
            ADD COLUMN IF NOT EXISTS referral VARCHAR(100),
            ADD COLUMN IF NOT EXISTS state VARCHAR(100),
            ADD COLUMN IF NOT EXISTS city VARCHAR(100),
            ADD COLUMN IF NOT EXISTS pincode VARCHAR(10),
            ADD COLUMN IF NOT EXISTS designation VARCHAR(100),
            ADD COLUMN IF NOT EXISTS domain VARCHAR(100),
            ADD COLUMN IF NOT EXISTS company VARCHAR(150),
            ADD COLUMN IF NOT EXISTS other_company VARCHAR(150),
            ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active',
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        `);
        
        console.log('Migration successful.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
