const db = require('../config/db');

const getSubscriptions = (query, params) => {
    return db.query(query, params);
};

const getSubscriptionById = (id) => {
    return db.query(
        `SELECT
            s.*,
            sp.name     AS plan_name,
            sp.category AS plan_category
         FROM subscriptions s
         LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
         WHERE s.id = $1`,
        [id]
    );
};

const addSubscription = (subscriptionData) => {
    const {
        user_id, plan_id,
        total_leads, used_leads,
        total_posters, used_posters,
        start_date, end_date, status
    } = subscriptionData;
    return db.query(
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
};

const updateSubscription = (id, subscriptionData) => {
    const {
        user_id, plan_id,
        total_leads, used_leads,
        total_posters, used_posters,
        start_date, end_date, status
    } = subscriptionData;
    return db.query(
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
};

const deleteSubscription = (id) => {
    return db.query(
        `DELETE FROM subscriptions WHERE id = $1 RETURNING id`,
        [id]
    );
};

module.exports = {
    getSubscriptions,
    getSubscriptionById,
    addSubscription,
    updateSubscription,
    deleteSubscription,
};
