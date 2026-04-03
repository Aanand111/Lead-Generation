const { pool } = require('../src/config/db');

async function fixPostersTable() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Check current columns in posters table
        const columnsRes = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'posters'
        `);
        const existingCols = columnsRes.rows.map(r => r.column_name);
        console.log('Current columns in posters table:', existingCols);

        // 2. Add 'thumbnail' column if missing
        if (!existingCols.includes('thumbnail')) {
            await client.query(`ALTER TABLE posters ADD COLUMN thumbnail TEXT`);
            console.log('✅ thumbnail column add ho gayi');
        } else {
            console.log('ℹ️  thumbnail pehle se exist karti hai');
        }

        // 3. Add 'category_id' column if missing
        if (!existingCols.includes('category_id')) {
            await client.query(`ALTER TABLE posters ADD COLUMN category_id INTEGER`);
            console.log('✅ category_id column add ho gayi');
        } else {
            console.log('ℹ️  category_id pehle se exist karti hai');
        }

        // 4. Add 'language' column if missing
        if (!existingCols.includes('language')) {
            await client.query(`ALTER TABLE posters ADD COLUMN language VARCHAR(50) DEFAULT 'English'`);
            console.log('✅ language column add ho gayi');
        } else {
            console.log('ℹ️  language pehle se exist karti hai');
        }

        // 5. Add 'is_premium' column if missing
        if (!existingCols.includes('is_premium')) {
            await client.query(`ALTER TABLE posters ADD COLUMN is_premium BOOLEAN DEFAULT false`);
            console.log('✅ is_premium column add ho gayi');
        } else {
            console.log('ℹ️  is_premium pehle se exist karti hai');
        }

        // 6. Add 'status' column if missing
        if (!existingCols.includes('status')) {
            await client.query(`ALTER TABLE posters ADD COLUMN status VARCHAR(20) DEFAULT 'Published'`);
            console.log('✅ status column add ho gayi');
        } else {
            console.log('ℹ️  status pehle se exist karti hai');
        }

        // 7. Add 'updated_at' column if missing
        if (!existingCols.includes('updated_at')) {
            await client.query(`ALTER TABLE posters ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
            console.log('✅ updated_at column add ho gayi');
        } else {
            console.log('ℹ️  updated_at pehle se exist karti hai');
        }

        // 8. Add Foreign Key constraint on category_id if not present
        const fkRes = await client.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'posters' 
              AND constraint_type = 'FOREIGN KEY'
              AND constraint_name = 'fk_posters_category'
        `);
        if (fkRes.rows.length === 0) {
            // Only add FK if poster_categories table exists
            const tableRes = await client.query(`
                SELECT to_regclass('public.poster_categories') as tbl
            `);
            if (tableRes.rows[0].tbl) {
                await client.query(`
                    ALTER TABLE posters 
                    ADD CONSTRAINT fk_posters_category 
                    FOREIGN KEY (category_id) REFERENCES poster_categories(id)
                `);
                console.log('✅ Foreign Key constraint add ho gayi');
            }
        } else {
            console.log('ℹ️  Foreign Key pehle se exist karta hai');
        }

        await client.query('COMMIT');
        console.log('\n✅ posters table migration complete!');

        // Show final structure
        const finalCols = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'posters' 
            ORDER BY ordinal_position
        `);
        console.log('\n📋 Final posters table structure:');
        finalCols.rows.forEach(r => console.log(`  ${r.column_name} - ${r.data_type}`));

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration fail ho gayi:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

fixPostersTable();
