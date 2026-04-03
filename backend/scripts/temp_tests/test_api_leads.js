const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testApi() {
    try {
        // We need a token. I'll get it from the DB for an admin user.
        const { pool } = require('./src/config/db');
        require('dotenv').config();
        
        const adminRes = await pool.query("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
        if (adminRes.rows.length === 0) {
            console.log("No admin user found.");
            process.exit(1);
        }
        const admin = adminRes.rows[0];
        console.log("Testing with admin:", admin.email || admin.phone);

        // Normally we'd login to get a token, but I'll manually sign one if possible or just use the logic from authMiddleware
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET || 'secretkey123');

        const res = await fetch('http://localhost:5000/api/admin/available-leads', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log("Status:", res.status);
        const data = await res.json();
        console.log("Data count:", data.data ? data.data.length : 'N/A');
        console.log("Sample lead:", data.data ? data.data[0] : 'N/A');

    } catch (e) {
        console.log("Error:", e.message);
    } finally {
        process.exit();
    }
}

testApi();
