const { pool } = require('./src/config/db');

(async () => {
    const categories = [
        'Industry Trends',
        'Platform News',
        'New Features',
        'Offers & Promotions',
        'Announcements'
    ];

    try {
        for (const name of categories) {
            await pool.query(
                `INSERT INTO news_categories (name, status, created_at, updated_at) 
                 VALUES ($1, true, NOW(), NOW()) 
                 ON CONFLICT (name) DO NOTHING`,
                [name]
            );
        }
        console.log("Categories inserted successfully!");
    } catch (e) {
        console.error("Error inserting categories:", e.message);
    }
    process.exit(0);
})();
