const { pool } = require('./src/config/db');

(async () => {
    try {
        await pool.query('ALTER TABLE news DROP COLUMN updated_at;');
        await pool.query('ALTER TABLE news ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();');
        console.log("Updated 'news' table 'updated_at' to TIMESTAMP.");
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
})();
