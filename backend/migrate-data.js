const { Pool } = require('pg');
require('dotenv').config();

const railwayUrl = "postgresql://postgres:MQymvtmbgUoCUAZCYgHlbBPxoQBgXAtN@shuttle.proxy.rlwy.net:39313/railway";

const localPool = new Pool({
    user: 'postgres', 
    host: 'localhost', 
    database: 'LeadDb', 
    password: 'admin', 
    port: 5432,
});

const remotePool = new Pool({ connectionString: railwayUrl });

const tables = [
    'users', 'user_profiles', 'leads', 'lead_purchases', 'lead_history', 
    'packages', 'user_packages', 'referrals', 'commission_transactions', 
    'posters', 'transactions', 'banners', 'news_categories', 'news', 
    'notifications', 'pincodes', 'available_leads', 'vendors', 
    'poster_categories', 'contact_messages', 'subscriptions', 
    'subscription_plans', 'system_settings', 'broadcast_campaigns', 
    'vendor_pincodes', 'vendor_categories', 'lead_categories', 
    'lead_feedback'
];

async function migrate() {
    try {
        console.log('Starting data migration...');
        await localPool.query('SELECT 1');
        await remotePool.query('SELECT 1');

        await remotePool.query("SET session_replication_role = 'replica'");

        for (const table of tables) {
            try {
                console.log(`\nTable: ${table}`);
                const tCheck = await remotePool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)", [table]);
                if (!tCheck.rows[0].exists) {
                    console.log(`Table ${table} does not exist on remote.`);
                    continue;
                }

                const lCols = (await localPool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1", [table])).rows;
                const rCols = (await remotePool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1", [table])).rows;
                
                const rColsMap = Object.fromEntries(rCols.map(c => [c.column_name, c.data_type]));
                const commonCols = lCols.filter(c => rColsMap[c.column_name]).map(c => ({ name: c.column_name, type: rColsMap[c.column_name] }));
                
                const data = (await localPool.query(`SELECT ${commonCols.map(c => `"${c.name}"`).join(', ')} FROM ${table}`)).rows;
                
                console.log(`Clearing ${table}...`);
                await remotePool.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);

                if (data.length === 0) {
                    console.log(`Table ${table} is empty.`);
                    continue;
                }

                console.log(`Migrating ${data.length} rows to ${table}...`);

                const queryText = `INSERT INTO ${table} (${commonCols.map(c => `"${c.name}"`).join(', ')}) VALUES (${commonCols.map((_, i) => `$${i + 1}`).join(', ')})`;
                
                for (const row of data) {
                    const values = commonCols.map(col => {
                        let val = row[col.name];
                        if (val && typeof val === 'object' && !Array.isArray(val) && !['jsonb', 'json'].includes(col.type)) {
                            return JSON.stringify(val);
                        }
                        if (Array.isArray(val) && col.type === 'numeric') return val[0];
                        return val;
                    });
                    await remotePool.query(queryText, values);
                }
                console.log(`✔ Table ${table} migrated.`);
            } catch (tableErr) {
                console.error(`⚠ Error in table ${table}:`, tableErr.message);
            }
        }

        await remotePool.query("SET session_replication_role = 'origin'");
        console.log('\n✅ MIGRATION ATTEMPT FINISHED!');
    } catch (err) {
        console.error('❌ Global failure:', err.message);
    } finally {
        await localPool.end(); 
        await remotePool.end();
    }
}

migrate();
// End of script
