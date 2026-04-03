const { pool } = require('./src/config/db');
require('dotenv').config();

async function syncLeads() {
    try {
        const leads = await pool.query("SELECT * FROM leads");
        console.log(`Found ${leads.rows.length} leads in 'leads' table.`);

        for (const lead of leads.rows) {
            try {
                // Simplified insert, ignoring duplicates
                await pool.query(`
                    INSERT INTO available_leads (
                        lead_uid, name, phone, email, source, status, priority, 
                        address, state, city, pincode, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    ON CONFLICT (lead_uid) DO NOTHING
                `, [
                    lead.lead_id || ('LD-' + Math.random().toString(36).substr(2, 9)), 
                    lead.customer_name, 
                    lead.customer_phone, 
                    lead.customer_email, 
                    'Admin', 
                    'Available', 
                    'Normal', 
                    '', 
                    lead.state, 
                    lead.city, 
                    lead.pincode, 
                    lead.created_at
                ]);
            } catch (innerErr) {
                console.log(`Failed to sync ${lead.lead_id}: ${innerErr.message}`);
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
