const { pool } = require('../src/config/db');

async function seed() {
    try {
        // Check if already exist
        const existing = await pool.query(
            "SELECT name FROM poster_categories WHERE name IN ('Wild', 'Nature')"
        );
        const existingNames = existing.rows.map(r => r.name);

        if (!existingNames.includes('Wild')) {
            await pool.query(
                "INSERT INTO poster_categories (name, status, created_at, updated_at) VALUES ('Wild', true, NOW(), NOW())"
            );
            console.log('✅ Wild category insert ho gayi!');
        } else {
            console.log('ℹ️  Wild pehle se exist karti hai.');
        }

        if (!existingNames.includes('Nature')) {
            await pool.query(
                "INSERT INTO poster_categories (name, status, created_at, updated_at) VALUES ('Nature', true, NOW(), NOW())"
            );
            console.log('✅ Nature category insert ho gayi!');
        } else {
            console.log('ℹ️  Nature pehle se exist karti hai.');
        }

        const all = await pool.query('SELECT * FROM poster_categories ORDER BY id');
        console.log('\n📋 Saari categories ab:');
        all.rows.forEach(r => console.log(`  ID: ${r.id} | Name: ${r.name} | Status: ${r.status}`));

        await pool.end();
    } catch (e) {
        console.error('❌ Error:', e.message);
        process.exit(1);
    }
}

seed();
