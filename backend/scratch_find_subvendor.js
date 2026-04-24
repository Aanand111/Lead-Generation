const db = require('./src/config/db');

async function findSubVendor() {
    try {
        console.log('Searching for Nirmal Thambe and Viking...');
        const victim = await db.query("SELECT id, full_name, role, referred_by, status FROM users WHERE full_name ILIKE '%Nirmal%'");
        const parent = await db.query("SELECT id, full_name, role FROM users WHERE full_name ILIKE '%Viking%'");
        
        console.log('Nirmal Records:', victim.rows);
        console.log('Viking Records:', parent.rows);
        
        if (victim.rows.length > 0) {
            const referredBy = victim.rows[0].referred_by;
            console.log(`Nirmal is referred by ID: ${referredBy}`);
        }
    } catch (error) {
        console.error('Error searching:', error);
    } finally {
        process.exit();
    }
}

findSubVendor();
