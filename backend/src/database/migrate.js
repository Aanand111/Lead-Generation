const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const {
    MIGRATIONS_TABLE,
    MIGRATION_LOCK_ID,
    migrationsPath,
    getMigrationFiles
} = require('./migrationRegistry');

const ensureMigrationsTable = async (client) => {
    await client.query(`
        CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
};

const runMigrations = async () => {
    const client = await pool.connect();

    try {
        console.log('Starting database migrations...');
        await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_ID]);
        console.log(`Migration lock acquired (${MIGRATION_LOCK_ID}).`);

        await ensureMigrationsTable(client);

        const files = getMigrationFiles();
        const executedResult = await client.query(`SELECT name FROM ${MIGRATIONS_TABLE}`);
        const executedMigrations = new Set(executedResult.rows.map((row) => row.name));

        for (const file of files) {
            if (executedMigrations.has(file)) {
                console.log(`Skipping ${file} - already executed.`);
                continue;
            }

            console.log(`Executing ${file}...`);
            const filePath = path.join(migrationsPath, file);
            const sql = fs.readFileSync(filePath, 'utf-8');

            await client.query('BEGIN');
            try {
                await client.query(sql);
                await client.query(`INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES ($1)`, [file]);
                await client.query('COMMIT');
                executedMigrations.add(file);
                console.log(`Successfully executed ${file}`);
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            }
        }

        console.log('All migrations completed successfully.');
    } finally {
        try {
            await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_ID]);
        } catch (unlockError) {
            console.warn(`Failed to release migration lock (${MIGRATION_LOCK_ID}):`, unlockError.message);
        }

        client.release();
    }
};

if (require.main === module) {
    runMigrations()
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exitCode = 1;
        })
        .finally(async () => {
            await pool.end();
        });
}

module.exports = {
    runMigrations
};
