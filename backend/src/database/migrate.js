const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

const runMigrations = async () => {
    const client = await pool.connect();
    try {
        console.log('Starting database migrations...');
        const migrationsPath = path.join(__dirname, 'migrations');

        // Check if migration table exists, if not create it
        await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        const files = fs.readdirSync(migrationsPath).filter(f => f.endsWith('.sql')).sort();

        for (const file of files) {
            // Check if migration already ran
            const { rows } = await client.query('SELECT * FROM migrations WHERE name = $1', [file]);
            if (rows.length > 0) {
                console.log(`Skipping ${file} - already executed.`);
                continue;
            }

            console.log(`Executing ${file}...`);
            const filePath = path.join(migrationsPath, file);
            const sql = fs.readFileSync(filePath, 'utf-8');

            // Execute SQL inside a transaction
            await client.query('BEGIN');
            try {
                await client.query(sql);
                await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
                await client.query('COMMIT');
                console.log(`Successfully executed ${file}`);
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            }
        }

        console.log('All migrations completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        client.release();
        pool.end();
    }
};

runMigrations();
