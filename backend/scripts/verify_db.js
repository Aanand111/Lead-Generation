const { pool } = require('../src/config/db');

async function verify() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'posters'
            ORDER BY ordinal_position
        `);
        console.log('\nPosters table columns:');
        res.rows.forEach(r => console.log(`  ${r.column_name} | ${r.data_type} | nullable: ${r.is_nullable}`));

        const cats = await pool.query('SELECT * FROM poster_categories ORDER BY id');
        console.log('\nPoster Categories:');
        cats.rows.forEach(r => console.log(`  ID: ${r.id} | Name: ${r.name} | Status: ${r.status}`));

        await pool.end();
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}
verify();
