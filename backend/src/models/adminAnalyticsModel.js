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

/**
 * Report: Detailed Lead Inventory
 * Tracks: Each lead, its lifecycle, who bought it, and when.
 */
const getDetailedLeadReports = async (filters = {}) => {
    const { startDate, endDate, category, status } = filters;
    let query = `
        SELECT 
            l.lead_id,
            l.customer_name,
            l.city,
            l.state,
            l.category,
            l.lead_value,
            u_creator.full_name as created_by_vendor,
            l.status as current_status,
            l.created_at as upload_date,
            lp.purchase_date,
            u_buyer.full_name as buyer_name,
            lp.credits_used
        FROM leads l
        LEFT JOIN users u_creator ON l.created_by = u_creator.id
        LEFT JOIN lead_purchases lp ON l.id = lp.lead_id
        LEFT JOIN users u_buyer ON lp.user_id = u_buyer.id
        WHERE 1=1
    `;
    const params = [];

    if (startDate) {
        params.push(startDate);
        query += ` AND l.created_at >= $${params.length}`;
    }
    if (endDate) {
        params.push(endDate);
        query += ` AND l.created_at <= $${params.length}`;
    }
    if (category) {
        params.push(category);
        query += ` AND l.category = $${params.length}`;
    }
    if (status) {
        params.push(status);
        query += ` AND l.status = $${params.length}`;
    }

    query += ` ORDER BY l.created_at DESC`;
    const result = await pool.query(query, params);
    return result.rows;
};

/**
 * Report: Vendor Performance Trends (6 Months)
 * Tracks: Monthly productivity of top vendors.
 */
const getVendorPerformanceTrends = async () => {
    const query = `
        SELECT 
            u.full_name as vendor_name,
            TO_CHAR(date_trunc('month', l.created_at), 'Mon YYYY') as month,
            COUNT(l.id) as leads_uploaded,
            COUNT(lp.id) as leads_sold
        FROM users u
        JOIN leads l ON l.created_by = u.id
        LEFT JOIN lead_purchases lp ON lp.lead_id = l.id
        WHERE u.role = 'vendor' 
        AND l.created_at >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY u.id, u.full_name, date_trunc('month', l.created_at)
        ORDER BY date_trunc('month', l.created_at) ASC, leads_uploaded DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

module.exports = {
    getVendorProductivity,
    getFeedbackTrends,
    getBannerPerformance,
    getSubscriptionAnalytics,
    getLeadLifecycleAnalytics,
    getDetailedLeadReports,
    getVendorPerformanceTrends
};
