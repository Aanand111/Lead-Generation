const { pool } = require('./backend/src/config/db');
require('dotenv').config({ path: './backend/.env' });

async function check() {
    try {
        console.log("--- LEADS TABLE ---");
        const leads = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'leads'");
        console.log(leads.rows);
        
        console.log("\n--- AVAILABLE_LEADS TABLE ---");
        const available = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'available_leads'");
        console.log(available.rows);

        const lCount = await pool.query("SELECT COUNT(*) FROM leads");
        console.log("\nLeads Count:", lCount.rows[0].count);

        const aCount = await pool.query("SELECT COUNT(*) FROM available_leads");
        console.log("Available Leads Count:", aCount.rows[0].count);

    } catch (e) {
        console.log("Error:", e.message);
    } finally {
        await pool.end();
    }
}
check();
