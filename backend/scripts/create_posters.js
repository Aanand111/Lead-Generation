const { pool } = require('../src/config/db');

async function createTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS posters (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                thumbnail TEXT,
                category_id INTEGER REFERENCES poster_categories(id),
                language VARCHAR(50) DEFAULT 'English',
                is_premium BOOLEAN DEFAULT false,
                status VARCHAR(20) DEFAULT 'Published',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("posters table created successfully");
        process.exit(0);
    } catch (err) {
        console.error("Error creating posters table:", err);
        process.exit(1);
    }
}

createTable();
