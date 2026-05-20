const db = require('../config/db');
const { broadcast } = require('../utils/socket');

// ── Schema Cache ────────────────────────────────────────────────────────────
// 'credits' column ka existence ek baar check karo, result cache karo.
// information_schema query slow hoti hai — har plan create/update pe
// fire karna waste hai kyunki schema runtime mein change nahi hota.
//
// Pehle:  har request pe 1 extra DB round-trip (information_schema scan)
// Ab:     server start ke baad sirf 1 baar, phir in-memory boolean
// ──────────────────────────────────────────────────────────────────────────────
let _creditsColCache = null; // null = not yet checked, true/false = cached result

const hasCreditsColumn = async () => {
    if (_creditsColCache !== null) return _creditsColCache; // cache hit — no DB call
    const result = await db.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_name = 'subscription_plans' AND column_name = 'credits'
         LIMIT 1`
    );
    _creditsColCache = result.rows.length > 0;
    return _creditsColCache;
};

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

        const validCategories = ['LEADS', 'POSTER', 'BOTH', 'PREMIUM'];
        const normalizedCategory = category.toUpperCase();

        if (!validCategories.includes(normalizedCategory)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
            });
        }

        // PREMIUM plans always include both leads + posters (superset of BOTH)
        const finalLeadsLimit = leads_limit || 0;
        const finalPosterLimit = poster_limit || 0;
        const finalCredits = credits || 0;

        // Column check — module-level cache se (sirf pehli baar DB hit hoti hai)
        const hasCreditsCol = await hasCreditsColumn();

        let result;
        if (hasCreditsCol) {
            result = await db.query(
                `INSERT INTO subscription_plans
                    (name, category, leads_limit, poster_limit, credits, price, duration, description, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING *`,
                [name, normalizedCategory, finalLeadsLimit, finalPosterLimit, finalCredits, price, duration || 30, description || null, status || 'Active']
            );
        } else {
            result = await db.query(
                `INSERT INTO subscription_plans
                    (name, category, leads_limit, poster_limit, price, duration, description, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING *`,
                [name, normalizedCategory, finalLeadsLimit, finalPosterLimit, price, duration || 30, description || null, status || 'Active']
            );
        }

        const newPlan = result.rows[0];

        // Broadcast notification to all active users/vendors
        try {
            await db.query(`
                INSERT INTO notifications (user_id, title, body, type, data)
                SELECT id, $1, $2, 'PLAN_ANNOUNCEMENT', $3
                FROM users 
                WHERE role != 'admin' AND status = 'ACTIVE'
            `, [
                `New Plan Launched: ${newPlan.name}`,
                `Check out our new ${newPlan.category} plan at ₹${newPlan.price}! Includes ${newPlan.leads_limit} leads and ${newPlan.poster_limit} posters.`,
                JSON.stringify({ plan_id: newPlan.id, type: 'subscription_plan' })
            ]);

            // Real-time broadcast
            broadcast('notification', {
                id: Date.now(),
                title: `New Plan Launched: ${newPlan.name}`,
                body: `Check out our new ${newPlan.category} plan at ₹${newPlan.price}! Includes ${newPlan.leads_limit} leads and ${newPlan.poster_limit} posters.`,
                time: 'Just now',
                isRead: false
            });
        } catch (notifyError) {
            console.error('[NOTIFY] Failed to broadcast new plan notification:', notifyError.message);
            // Don't fail the request if notification fails
        }

        res.status(201).json({
            success: true,
            message: 'Subscription plan created and broadcasted successfully',
            data: newPlan
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

        const validCategories = ['LEADS', 'POSTER', 'BOTH', 'PREMIUM'];
        const normalizedCategory = category.toUpperCase();

        if (!validCategories.includes(normalizedCategory)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
            });
        }

        // Column check — same cache, no extra DB query
        const hasCreditsCol2 = await hasCreditsColumn();

        let result;
        if (hasCreditsCol2) {
            result = await db.query(
                `UPDATE subscription_plans
                 SET name = $1, category = $2, leads_limit = $3, poster_limit = $4,
                     credits = $5, price = $6, duration = $7, description = $8, status = $9,
                     updated_at = NOW()
                 WHERE id = $10
                 RETURNING *`,
                [name, normalizedCategory, leads_limit || 0, poster_limit || 0, credits || 0, price, duration || 30, description || null, status || 'Active', id]
            );
        } else {
            result = await db.query(
                `UPDATE subscription_plans
                 SET name = $1, category = $2, leads_limit = $3, poster_limit = $4,
                     price = $5, duration = $6, description = $7, status = $8,
                     updated_at = NOW()
                 WHERE id = $9
                 RETURNING *`,
                [name, normalizedCategory, leads_limit || 0, poster_limit || 0, price, duration || 30, description || null, status || 'Active', id]
            );
        }

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
