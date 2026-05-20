const db = require('../config/db');
const { processCommissionAsync } = require('../services/commissionService');

// ── GET all subscriptions (with plan name & user info) ────────────
const getSubscriptions = async (req, res, next) => {
    try {
        const { status, user_id, plan_id } = req.query;

        // Pagination parameters
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const offset = (page - 1) * limit;

        let query = `
            SELECT
                s.id,
                s.user_id,
                u.full_name as user_name,
                u.phone as user_phone,
                s.plan_id,
                sp.name        AS plan_name,
                sp.category    AS plan_category,
                sp.price       AS plan_price,
                s.total_leads,
                s.used_leads,
                s.total_posters,
                s.used_posters,
                s.start_date,
                s.end_date,
                s.status,
                s.created_at,
                s.updated_at
            FROM subscriptions s
            LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
            LEFT JOIN users u ON u.id = s.user_id
        `;
        const params = [];
        const conditions = [];

        if (status) {
            params.push(status);
            conditions.push(`s.status = $${params.length}`);
        }
        if (user_id) {
            params.push(user_id);
            conditions.push(`s.user_id = $${params.length}`);
        }
        if (plan_id) {
            params.push(plan_id);
            conditions.push(`s.plan_id = $${params.length}`);
        }

        let whereClause = '';
        if (conditions.length > 0) {
            whereClause = ` WHERE ` + conditions.join(' AND ');
            query += whereClause;
        }

        // Count query for pagination meta
        const countQuery = `SELECT COUNT(*) FROM subscriptions s ${whereClause}`;
        const countResult = await db.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count, 10);

        query += ` ORDER BY s.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        const result = await db.query(query, [...params, limit, offset]);

        res.status(200).json({ 
            success: true, 
            data: result.rows,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// ── GET single subscription ───────────────────────────────────────
const getSubscriptionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT
                s.*,
                sp.name     AS plan_name,
                sp.category AS plan_category,
                sp.price    AS plan_price
             FROM subscriptions s
             LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
             WHERE s.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Subscription found' });
        }

        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

// ── CREATE subscription ───────────────────────────────────────────
const addSubscription = async (req, res, next) => {
    try {
        const {
            user_id, plan_id,
            total_leads, used_leads,
            total_posters, used_posters,
            start_date, end_date, status
        } = req.body;

        if (!user_id || !plan_id || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'user_id, plan_id, start_date, and end_date are required.'
            });
        }

        // Verify plan exists & get price for commission
        const planCheck = await db.query(
            `SELECT id, name, price FROM subscription_plans WHERE id = $1`,
            [plan_id]
        );
        if (planCheck.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Subscription plan not found.' });
        }
        const plan = planCheck.rows[0];

        const result = await db.query(
            `INSERT INTO subscriptions
                (user_id, plan_id, total_leads, used_leads, total_posters, used_posters, start_date, end_date, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [
                user_id,
                plan_id,
                total_leads   || 0,
                used_leads    || 0,
                total_posters || 0,
                used_posters  || 0,
                start_date,
                end_date,
                status        || 'Active'
            ]
        );

        const subscription = result.rows[0];

        // --- ASYNC COMMISSION PROCESSING (non-blocking) ---
        // Commission runs in the background; subscription creation response
        // is returned immediately. A failure here does NOT affect the subscription.
        if (plan.price > 0 && status !== 'Inactive') {
            processCommissionAsync(
                user_id,
                parseFloat(plan.price),
                `Plan Purchase: ${plan.name}`
            );
        }

        res.status(201).json({
            success: true,
            message: 'Subscription created successfully',
            data: subscription
        });
    } catch (error) {
        next(error);
    }
};

// ── UPDATE subscription ───────────────────────────────────────────
const updateSubscription = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            user_id, plan_id,
            total_leads, used_leads,
            total_posters, used_posters,
            start_date, end_date, status
        } = req.body;

        if (!user_id || !plan_id || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'user_id, plan_id, start_date, and end_date are required.'
            });
        }

        const result = await db.query(
            `UPDATE subscriptions
             SET user_id       = $1,
                 plan_id       = $2,
                 total_leads   = $3,
                 used_leads    = $4,
                 total_posters = $5,
                 used_posters  = $6,
                 start_date    = $7,
                 end_date      = $8,
                 status        = $9,
                 updated_at    = NOW()
             WHERE id = $10
             RETURNING *`,
            [
                user_id,
                plan_id,
                total_leads   || 0,
                used_leads    || 0,
                total_posters || 0,
                used_posters  || 0,
                start_date,
                end_date,
                status        || 'Active',
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Subscription not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Subscription updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

// ── DELETE subscription ───────────────────────────────────────────
const deleteSubscription = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `DELETE FROM subscriptions WHERE id = $1 RETURNING id`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Subscription not found' });
        }

        res.status(200).json({ success: true, message: 'Subscription deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSubscriptions,
    getSubscriptionById,
    addSubscription,
    updateSubscription,
    deleteSubscription,
};
