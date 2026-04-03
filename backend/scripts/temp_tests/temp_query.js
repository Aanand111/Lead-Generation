const { pool } = require('./src/config/db');
const fs = require('fs');

(async () => {
    try {
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
        const res2 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='news'");
        const res3 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='news_categories'");
        
        let out = "TABLES: " + res.rows.map(r => r.table_name).join(", ") + "\n";
        out += "NEWS COLUMNS: " + JSON.stringify(res2.rows) + "\n";
        out += "NEWS_CATEGORIES COLUMNS: " + JSON.stringify(res3.rows) + "\n";
        
        fs.writeFileSync('query_out.json', out, 'utf8');
    } catch (e) {
        fs.writeFileSync('query_out.json', String(e), 'utf8');
    }
    process.exit(0);
})();
