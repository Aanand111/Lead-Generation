const db = require('../config/db');

// ── GET all plans ────────────────────────────────────────────────
const getSubscriptionPlans = async (req, res, next) => {
    try {
        const { status, category } = req.query;

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

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        query += ` ORDER BY created_at DESC`;

        const result = await db.query(query, params);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
};

// ── GET single plan ──────────────────────────────────────────────
const getSubscriptionPlanById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT * FROM subscription_plans WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Subscription plan not found' });
        }

        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

// ── CREATE plan ──────────────────────────────────────────────────
const addSubscriptionPlan = async (req, res, next) => {
    try {
        const { name, category, leads_limit, poster_limit, credits, price, duration, description, status } = req.body;

        if (!name || !category || price === undefined || price === null) {
            return res.status(400).json({
                success: false,
                message: 'Name, category, and price are required fields.'
            });
        }

        const validCategories = ['LEADS', 'POSTER', 'BOTH'];
        const normalizedCategory = category.toUpperCase();

        if (!validCategories.includes(normalizedCategory)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
            });
        }

        const result = await db.query(
            `INSERT INTO subscription_plans
                (name, category, leads_limit, poster_limit, credits, price, duration, description, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [
                name,
                normalizedCategory,
                leads_limit || 0,
                poster_limit || 0,
                credits || 0,
                price,
                duration || 30,
                description || null,
                status || 'Active'
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Subscription plan created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

// ── UPDATE plan ──────────────────────────────────────────────────
const updateSubscriptionPlan = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, category, leads_limit, poster_limit, credits, price, duration, description, status } = req.body;

        if (!name || !category || price === undefined || price === null) {
            return res.status(400).json({
                success: false,
                message: 'Name, category, and price are required fields.'
            });
        }

        const validCategories = ['LEADS', 'POSTER', 'BOTH'];
        const normalizedCategory = category.toUpperCase();

        if (!validCategories.includes(normalizedCategory)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
            });
        }

        const result = await db.query(
            `UPDATE subscription_plans
             SET name = $1, category = $2, leads_limit = $3, poster_limit = $4,
                 credits = $5, price = $6, duration = $7, description = $8, status = $9,
                 updated_at = NOW()
             WHERE id = $10
             RETURNING *`,
            [name, normalizedCategory, leads_limit || 0, poster_limit || 0, credits || 0, price, duration || 30, description || null, status || 'Active', id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Subscription plan not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Subscription plan updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

// ── DELETE plan ──────────────────────────────────────────────────
const deleteSubscriptionPlan = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `DELETE FROM subscription_plans WHERE id = $1 RETURNING id`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Subscription plan not found' });
        }

        res.status(200).json({ success: true, message: 'Subscription plan deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSubscriptionPlans,
    getSubscriptionPlanById,
    addSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
};
