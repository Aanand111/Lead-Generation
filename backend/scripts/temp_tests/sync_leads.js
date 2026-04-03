const { pool } = require('./src/config/db');
require('dotenv').config();

async function syncLeads() {
    try {
        const leads = await pool.query("SELECT * FROM leads");
        console.log(`Found ${leads.rows.length} leads in 'leads' table.`);

        for (const lead of leads.rows) {
            // Check if already in available_leads
            const exists = await pool.query("SELECT id FROM available_leads WHERE lead_uid = $1", [lead.lead_id]);
            
            if (exists.rows.length === 0) {
                console.log(`Syncing lead ${lead.lead_id}...`);
                await pool.query(`
                    INSERT INTO available_leads (
                        lead_uid, name, phone, email, source, status, priority, 
                        address, state, city, pincode, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                `, [
                    lead.lead_id, 
                    lead.customer_name, 
                    lead.customer_phone, 
                    lead.customer_email, 
                    'Admin Upload', 
                    'Available', 
                    'Normal', 
                    '', 
                    lead.state, 
                    lead.city, 
                    lead.pincode, 
                    lead.created_at
                ]);
            }
        }
        console.log("Sync complete.");
    } catch (e) {
        console.error("Error syncing:", e.message);
    } finally {
        await pool.end();
    }
}

syncLeads();
