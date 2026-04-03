require('dotenv').config({ path: './backend/.env' });
const { pool } = require('./backend/src/config/db');

async function checkLeads() {
    try {
        const leadsCount = await pool.query("SELECT COUNT(*) FROM leads");
        console.log("Leads count:", leadsCount.rows[0].count);

        try {
            const availableLeadsCount = await pool.query("SELECT COUNT(*) FROM available_leads");
            console.log("Available Leads count:", availableLeadsCount.rows[0].count);
            
            if (parseInt(availableLeadsCount.rows[0].count) > 0) {
                const sample = await pool.query("SELECT * FROM available_leads LIMIT 1");
                console.log("Sample available lead:", sample.rows[0]);
            }
        } catch (e) {
            console.log("available_leads table might not exist:", e.message);
        }

    } catch (err) {
        console.error("Error checking leads:", err);
    } finally {
        await pool.end();
    }
}

checkLeads();
