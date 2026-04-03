const { pool } = require('../src/config/db');

async function createTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS poster_categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                status BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("poster_categories table created successfully");
        process.exit(0);
    } catch (err) {
        console.error("Error creating poster_categories table:", err);
        process.exit(1);
    }
}

createTable();
