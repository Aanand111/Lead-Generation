const { pool } = require('./src/config/db');
(async () => {
    try {
        const res = await pool.query('SELECT * FROM news');
        console.log("news contents:", res.rows);
        const res2 = await pool.query('SELECT * FROM news_categories');
        console.log("news categories contents:", res2.rows);
    } catch (e) {
        console.error(e.message);
    }
    process.exit(0);
})();
