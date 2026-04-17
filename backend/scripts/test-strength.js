try {
    const { pool } = require('../src/config/db');
    const { createBroadcast } = require('../src/controllers/adminCampaignController');

    async function testBackendStrength() {
        console.log('🚀 Starting Backend Strength Test (10,000 Mock Users simulation)...');
        
        try {
            // 1. Clean up old test data to avoid bloat
            console.log('🧹 Cleaning up old test data...');
            await pool.query("DELETE FROM users WHERE email LIKE 'testuser_%@example.com'");
            
            // 2. Insert 10,000 mock users fast using a single query
            console.log('📝 Generating 10,000 mock users...');
            const startInsert = Date.now();
            await pool.query(`
                INSERT INTO users (phone, email, password_hash, role, status, full_name, referral_code)
                SELECT 
                    '9' || LPAD(s.id::text, 9, '0'),
                    'testuser_' || s.id || '@example.com',
                    '$2b$10$K9WvN.6pC0YvX8N1Y6Y6uO', -- dummy hash
                    'user',
                    'ACTIVE',
                    'Test User ' || s.id,
                    'REF' || s.id
                FROM generate_series(1, 10000) AS s(id)
            `);
            console.log(`✅ 10,000 Users inserted in ${Date.now() - startInsert}ms`);

            // 3. Trigger a Broadcast Campaign
            console.log('📢 Initiating Mass Broadcast (10,000 Users)...');
            const req = {
                body: {
                    title: 'STRESS TEST MESSAGE',
                    body: 'This is a high-volume performance test notification.',
                    role: 'user'
                }
            };
            const res = {
                status: function(code) { this.statusCode = code; return this; },
                json: function(data) { this.data = data; return this; }
            };
            const next = (err) => { if(err) console.error('Next Error:', err); };

            await createBroadcast(req, res, next);
            
            if (!res.data || !res.data.campaign_id) {
                throw new Error('Broadcast initiation failed: ' + JSON.stringify(res.data));
            }
            
            const campaignId = res.data.campaign_id;
            console.log(`✅ Campaign Initiated! ID: ${campaignId}`);

            // 4. Monitor Progress
            console.log('📊 Monitoring progress (Check Every 2 seconds)...');
            let completed = false;
            const startTime = Date.now();

            while (!completed) {
                const { rows } = await pool.query('SELECT * FROM broadcast_campaigns WHERE id = $1', [campaignId]);
                const c = rows[0];
                const progress = ((c.processed_users / c.total_users) * 100).toFixed(2);
                
                console.log(`[PROGRESS] ${c.processed_users}/${c.total_users} (${progress}%) | Status: ${c.status} | Speed: ${Math.round(c.processed_users / ((Date.now() - startTime)/1000))} msg/sec`);

                if (c.status === 'COMPLETED' || c.status === 'FAILED' || (c.processed_users >= c.total_users && c.total_users > 0)) {
                    completed = true;
                    console.log('\n--- TEST RESULTS ---');
                    console.log(`Total Time: ${Date.now() - startTime}ms`);
                    console.log(`Final Status: ${c.status}`);
                    console.log(`Success: ${c.success_count} | Failed: ${c.failure_count}`);
                    console.log('--------------------\n');
                } else {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

        } catch (error) {
            console.error('❌ Strength Test Failed during execution:', error);
        } finally {
            process.exit(0);
        }
    }

    testBackendStrength();

} catch (requireError) {
    console.error('❌ Strength Test Failed during setup (Require/Load):', requireError);
    process.exit(1);
}
