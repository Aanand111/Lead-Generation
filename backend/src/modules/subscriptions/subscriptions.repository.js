const { pool } = require('../../config/db');

class SubscriptionsRepository {
    // --- Plans ---
    async findPlanById(id, client = pool) {
        const result = await client.query('SELECT * FROM subscription_plans WHERE id = $1', [id]);
        return result.rows[0];
    }

    async findAllPlans(filters) {
        const { status, category } = filters;
        let query = `SELECT * FROM subscription_plans`;
        const params = [];
        const conditions = [];

        if (status) {
            params.push(status);
            conditions.push(`status = $${params.length}`);
        }
        if (category) {
            params.push(category);
            conditions.push(`category = $${params.length}`);
        }

        if (conditions.length > 0) query += ` WHERE ` + conditions.join(' AND ');
        query += ` ORDER BY created_at DESC`;

        const result = await pool.query(query, params);
        return result.rows;
    }

    // --- Subscriptions ---
    async createSubscription(subData, client) {
        const { user_id, plan_id, total_leads, total_posters, start_date, end_date, status } = subData;
        const result = await client.query(
            `INSERT INTO subscriptions (user_id, plan_id, total_leads, used_leads, total_posters, used_posters, start_date, end_date, status)
             VALUES ($1, $2, $3, 0, $4, 0, $5, $6, $7) RETURNING *`,
            [user_id, plan_id, total_leads, total_posters, start_date, end_date, status || 'Active']
        );
        return result.rows[0];
    }

    async findActiveSubscription(userId, category) {
        // Find latest active subscription for a category
        const result = await pool.query(
            `SELECT s.* FROM subscriptions s
             JOIN subscription_plans sp ON s.plan_id = sp.id
             WHERE s.user_id = $1 AND s.status = 'Active' AND s.end_date > NOW()
             AND (sp.category = $2 OR sp.category = 'BOTH')
             ORDER BY s.end_date DESC LIMIT 1`,
            [userId, category]
        );
        return result.rows[0];
    }
}

module.exports = new SubscriptionsRepository();
