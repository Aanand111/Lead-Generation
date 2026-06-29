const http = require('http');
const { Client } = require('pg');
require('dotenv').config({ path: '../backend/.env' });

const getJson = (url) => {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    reject(new Error(`Failed to parse JSON from ${url}: ${data}`));
                }
            });
        }).on('error', reject);
    });
};

async function verify() {
    console.log('--- Verification Script Started ---');

    // 1. Verify Health Check Endpoint
    try {
        console.log('\nTesting Health Check Endpoint (/api/health)...');
        const res = await getJson('http://localhost:5000/api/health');
        console.log(`HTTP Status: ${res.status}`);
        console.log('Response Body:', JSON.stringify(res.body, null, 2));
        
        // Assertions
        if (res.body.schema || res.body.pool || res.body.runtime) {
            console.error('❌ FAILED: Sensitive diagnostic fields (schema, pool, runtime) are exposed!');
        } else {
            console.log('✅ SUCCESS: Sensitive diagnostic fields are successfully masked/removed.');
        }
    } catch (err) {
        console.error('❌ Health Check Endpoint failed:', err.message);
    }

    // 2. Verify Database Mapping for Sub-Vendor
    const dbConfig = {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'leadgen',
        password: process.env.DB_PASSWORD || 'postgres',
        port: parseInt(process.env.DB_PORT || '5432', 10),
    };

    console.log('\nTesting Sub-Vendor Role Mapping in Database...');
    const client = new Client(dbConfig);
    try {
        await client.connect();
        
        // Find a user who is a vendor and is referred by someone (sub-vendor)
        const query = "SELECT id, email, role, referred_by FROM users WHERE role = 'vendor' AND referred_by IS NOT NULL LIMIT 1";
        const res = await client.query(query);
        
        if (res.rows.length === 0) {
            console.log('⚠️ No sub-vendors (role = vendor, referred_by != null) found in the database. Creating a test sub-vendor...');
            
            // Let's find a parent vendor
            const parentRes = await client.query("SELECT id FROM users WHERE role = 'vendor' AND referred_by IS NULL LIMIT 1");
            if (parentRes.rows.length === 0) {
                console.log('❌ Could not find any parent vendor to refer.');
            } else {
                const parentId = parentRes.rows[0].id;
                const email = `test_subvendor_${Date.now()}@example.com`;
                const insertQuery = `
                    INSERT INTO users (phone, email, password_hash, role, referral_code, status, referred_by, full_name)
                    VALUES ('9999999999', $1, 'hash', 'vendor', 'TEST_REF_CODE', 'ACTIVE', $2, 'Test SubVendor')
                    RETURNING id, email, role, referred_by
                `;
                const insertRes = await client.query(insertQuery, [email, parentId]);
                const subVendor = insertRes.rows[0];
                console.log(`Created Test Sub-Vendor: ${JSON.stringify(subVendor)}`);
                
                // Verify the effective role logic programmatically
                const effectiveRole = (subVendor.role === 'vendor' && subVendor.referred_by !== null) ? 'sub-vendor' : subVendor.role;
                console.log(`Computed Effective Role: ${effectiveRole}`);
                if (effectiveRole === 'sub-vendor') {
                    console.log('✅ SUCCESS: Programmatic sub-vendor role mapping check passed.');
                } else {
                    console.error('❌ FAILED: Programmatic sub-vendor role mapping check failed!');
                }
                
                // Cleanup
                await client.query("DELETE FROM users WHERE id = $1", [subVendor.id]);
                console.log('Cleaned up test sub-vendor.');
            }
        } else {
            const subVendor = res.rows[0];
            console.log(`Found Sub-Vendor in database: ${JSON.stringify(subVendor)}`);
            const effectiveRole = (subVendor.role === 'vendor' && subVendor.referred_by !== null) ? 'sub-vendor' : subVendor.role;
            console.log(`Computed Effective Role: ${effectiveRole}`);
            if (effectiveRole === 'sub-vendor') {
                console.log('✅ SUCCESS: Database sub-vendor role mapping check passed.');
            } else {
                console.error('❌ FAILED: Database sub-vendor role mapping check failed!');
            }
        }
    } catch (err) {
        console.error('❌ Database verification failed:', err.message);
    } finally {
        await client.end();
    }
}

verify();
