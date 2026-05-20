const { pool } = require('./src/config/db');

async function runMigration() {
    const sql = `
        INSERT INTO packages (name, type, category, price, credits, lead_limit, validity_days, description, features, is_active, sort_order)
        VALUES (
            'SUPREME ELITE PREMIUM', 
            'SUBSCRIPTION', 
            'PREMIUM', 
            1499.00, 
            500, 
            25, 
            30, 
            'The absolute pinnacle of lead generation. Includes Black & Gold VIP dashboard, priority lead delivery, and advanced analytics.',
            '["VIP Dashboard Access", "Priority Lead Delivery", "Advanced Analytics", "Dedicated Account Manager", "Elite Poster Templates"]'::jsonb,
            true,
            1
        ) ON CONFLICT DO NOTHING;
    `;
    try {
        await pool.query(sql);
        console.log('Supreme Elite Premium plan created successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error creating premium plan:', err);
        process.exit(1);
    }
}

runMigration();
