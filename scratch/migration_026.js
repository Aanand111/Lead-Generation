const { pool } = require('./backend/src/config/db');

async function runMigration() {
    try {
        console.log('Starting migration: 026_link_vendors_to_users');
        
        // 1. Add user_id column
        await pool.query(`
            ALTER TABLE vendors ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
        `);
        console.log('Column user_id added to vendors table.');

        // 2. Backfill user_id from users table based on phone
        // We trim and handle potential case differences if any
        const backfillResult = await pool.query(`
            UPDATE vendors v
            SET user_id = u.id
            FROM users u
            WHERE BTRIM(v.phone) = BTRIM(u.phone)
            AND v.user_id IS NULL;
        `);
        console.log(`Backfilled ${backfillResult.rowCount} vendor records with user_id.`);

        // 3. Optional: Add an index for performance
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
        `);
        console.log('Index created on vendors(user_id).');

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

runMigration();
