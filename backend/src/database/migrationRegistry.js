const fs = require('fs');
const path = require('path');

const MIGRATIONS_TABLE = 'migrations';
const MIGRATION_LOCK_ID = Number.parseInt(process.env.MIGRATION_LOCK_ID || '42851017', 10);
const migrationsPath = path.join(__dirname, 'migrations');

const getMigrationFiles = () => fs.readdirSync(migrationsPath)
    .filter((file) => file.endsWith('.sql'))
    .sort();

module.exports = {
    MIGRATIONS_TABLE,
    MIGRATION_LOCK_ID,
    migrationsPath,
    getMigrationFiles
};
