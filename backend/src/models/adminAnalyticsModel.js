const { pool } = require('../config/db');

/**
 * Report: Vendor Productivity 
 * Tracks: Uploaded leads, Successfully purchased leads, and overall conversion.
 */
const getVendorProductivity = async () => {
    const query = `
        SELECT 
            u.id, 
            u.full_name as vendor_name, 
            u.phone,
            COUNT(DISTINCT l.id) as leads_uploaded,
            COUNT(DISTINCT lp.id) as leads_purchased,
            CASE 
                WHEN COUNT(DISTINCT l.id) = 0 THEN 0 
                ELSE (CAST(COUNT(DISTINCT lp.id) AS FLOAT) / COUNT(DISTINCT l.id)) * 100 
            END as conversion_rate,
            u.vendor_rating,
            u.reports_count
        FROM users u
        LEFT JOIN leads l ON l.created_by = u.id
        LEFT JOIN lead_purchases lp ON lp.lead_id = l.id
        WHERE u.role = 'vendor' OR u.role = 'admin'
        GROUP BY u.id
        ORDER BY leads_uploaded DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

/**
 * Report: Feedback Trends
 * Tracks: Average ratings and feedback volume over time (monthly).
 */
const getFeedbackTrends = async () => {
    const query = `
        SELECT 
            TO_CHAR(date_trunc('month', created_at), 'Month YYYY') as month_year,
            AVG(rating) as avg_rating,
            COUNT(*) as feedback_volume,
            COUNT(*) FILTER (WHERE rating <= 2) as negative_reports
        FROM lead_feedback
        GROUP BY date_trunc('month', created_at)
        ORDER BY date_trunc('month', created_at) DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

/**
 * Report: Banner Performance (CTR)
 * Tracks: Visual engagement and click-through rates.
 */
const getBannerPerformance = async () => {
    const query = `
        SELECT 
            title, 
            type,
            placement,
            views, 
            clicks, 
            CASE 
                WHEN views = 0 THEN 0 
                ELSE (CAST(clicks AS FLOAT) / views) * 100 
            END as ctr
        FROM banners
        WHERE is_active = true
        ORDER BY ctr DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

/**
 * Report: Subscription Analytics
 * Tracks: Plan distribution, revenue by plan, and active vs expired counts.
 */
const getSubscriptionAnalytics = async () => {
    const query = `
        SELECT 
            p.name as plan_name,
            p.category,
            COUNT(s.id) as subscriber_count,
            SUM(p.price) as revenue_generated,
            COUNT(*) FILTER (WHERE s.status = 'Active') as active_now
        FROM subscription_plans p
        LEFT JOIN subscriptions s ON s.plan_id = p.id
        GROUP BY p.id, p.name, p.category
        ORDER BY subscriber_count DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

/**
 * Report: Lead Lifecycle Analytics
 * Tracks: Upload vs Purchase trends, category distribution.
 */
const getLeadLifecycleAnalytics = async () => {
    const dailyVolumeQuery = `
        SELECT 
            TO_CHAR(d.day_val, 'DD Mon') as period,
            COALESCE(COUNT(DISTINCT l.id), 0) as uploaded,
            COALESCE(COUNT(DISTINCT lp.id), 0) as purchased
        FROM (
            SELECT generate_series(CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE, '1 day'::interval)::date as day_val
        ) d
        LEFT JOIN leads l ON l.created_at::date = d.day_val
        LEFT JOIN lead_purchases lp ON lp.purchase_date::date = d.day_val
        GROUP BY d.day_val
        ORDER BY d.day_val
    `;

    const categoryDistributionQuery = `
        SELECT 
            category,
            COUNT(*) as count
        FROM leads
        GROUP BY category
        ORDER BY count DESC
    `;

    const [dailyVolume, categoryDist] = await Promise.all([
        pool.query(dailyVolumeQuery),
        pool.query(categoryDistributionQuery)
    ]);

    return {
        dailyVolume: dailyVolume.rows,
        categoryDistribution: categoryDist.rows
    };
};

module.exports = {
    getVendorProductivity,
    getFeedbackTrends,
    getBannerPerformance,
    getSubscriptionAnalytics,
    getLeadLifecycleAnalytics
};
