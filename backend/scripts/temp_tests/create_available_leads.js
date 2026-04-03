const { pool } = require('./src/config/db');

async function createTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS available_leads (
                id SERIAL PRIMARY KEY,
                lead_id VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(100),
                phone_number VARCHAR(20),
                category VARCHAR(50),
                email VARCHAR(100),
                address TEXT,
                state VARCHAR(50),
                city VARCHAR(50),
                pin_code VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("available_leads table created.");

        // We can insert some dummy data if empty
        const res = await pool.query('SELECT COUNT(*) FROM available_leads');
        if (parseInt(res.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO available_leads (lead_id, name, phone_number, category, email, address, state, city, pin_code)
                VALUES 
                ('INS042', '!@#$%^&*()_+{}:"<>?', '123_______', 'R', 'ads@gmail.com', 'Test', 'Madhya Pradesh', 'Indore', '452016'),
                ('INS038', 'vinod khanna', '02345 67890', 'Verified', 'vk@gmail.com', 'vinod home, mumbai', 'Maharashtra', 'Mumbai', '452009'),
                ('INS039', 'Sumit malviya', '85274 19635', 'Confirmed', 'sm@gmail.com', 'sumit Home, delhi', 'Delhi', 'Delhi', '854006'),
                ('INS040', 'Neha raj', '74596 81235', 'R', 'nr@gmail.com', 'neha home', 'Gujarat', 'Ahmedabad', '875006')
            `);
            console.log("Dummy data inserted.");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

createTable();
