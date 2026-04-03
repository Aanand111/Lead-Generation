require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT,
});

async function simulatePurchase() {
    const client = await pool.connect();
    try {
        const userId = '4f117792-7efc-4056-84b5-69d5d47c46dc'; // user with 50.50 credits
        const leadRes = await pool.query("SELECT id FROM leads LIMIT 1 OFFSET 3"); // different lead
        const leadId = leadRes.rows[0].id;
        const cost = 10;

        console.log(`Simulating purchase for user=${userId}, balance=50.50, lead=${leadId}`);

        await client.query('BEGIN');
        const userRes = await client.query('SELECT wallet_balance FROM users WHERE id = $1 FOR UPDATE', [userId]);
        const balance = parseFloat(userRes.rows[0].wallet_balance);
        console.log(`Current balance: ${balance}`);

        if (balance < cost) {
            console.log('Insufficient credits!');
            await client.query('ROLLBACK');
            return;
        }

        await client.query('UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2', [cost, userId]);
        console.log('Balance updated.');

        await client.query(
            'INSERT INTO lead_purchases (user_id, lead_id, credits_used, status) VALUES ($1, $2, $3, $4)',
            [userId, leadId, cost, 'ACQUIRED']
        );
        console.log('Purchase record inserted.');

        await client.query(
            'INSERT INTO transactions (user_id, type, amount, credits, status, remarks) VALUES ($1, $2, $3, $4, $5, $6)',
            [userId, 'PURCHASE', 0, cost, 'SUCCESS', `Purchased lead ${leadId}`]
        );
        console.log('Transaction log inserted.');

        await client.query('COMMIT');
        console.log('COMMIT SUCCESS!');

    } catch (err) {
        console.error('FAILED:', err.message);
        console.error('Stack:', err.stack);
        await client.query('ROLLBACK');
    } finally {
        client.release();
        await pool.end();
    }
}

simulatePurchase();
