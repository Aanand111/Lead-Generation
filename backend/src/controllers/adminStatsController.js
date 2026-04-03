const db = require('../config/db');

const getStats = async (req, res, next) => {
    try {
        const statsQuery = `
            SELECT 'customers' as type, COUNT(*) as count FROM users WHERE role = 'customer'
            UNION ALL
            SELECT 'vendors' as type, COUNT(*) as count FROM users WHERE role = 'vendor'
            UNION ALL
            SELECT 'leads' as type, COUNT(*) as count FROM leads
            UNION ALL
            SELECT 'subscriptions' as type, COUNT(*) as count FROM subscriptions WHERE status = 'Active'
            UNION ALL
            SELECT 'total_remaining_leads' as type, COALESCE(SUM(total_leads - used_leads), 0) as count FROM subscriptions WHERE status = 'Active'
        `;

        const topVendorsQuery = `
            SELECT 
                u.full_name as name, 
                COUNT(l.id) as leads_uploaded,
                COALESCE(u.vendor_rating, 0) as rating
            FROM users u
            JOIN leads l ON l.created_by = u.id
            WHERE u.role = 'vendor'
            GROUP BY u.id, u.full_name, u.vendor_rating
            ORDER BY leads_uploaded DESC
            LIMIT 3
        `;

        const recentActivityQuery = `
            SELECT 'Lead Uploaded' as activity, customer_name as detail, created_at as timestamp 
            FROM leads 
            ORDER BY created_at DESC LIMIT 5
        `;

        const trendQuery = `
            SELECT 
                TO_CHAR(d.day_val, 'DD Mon') as day,
                COALESCE(COUNT(l.id), 0) as leads
            FROM (
                SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval)::date as day_val
            ) d
            LEFT JOIN leads l ON l.created_at::date = d.day_val
            GROUP BY d.day_val
            ORDER BY d.day_val
        `;

        const [statsResult, topVendors, recentActivity, trendData] = await Promise.all([
            db.query(statsQuery),
            db.query(topVendorsQuery),
            db.query(recentActivityQuery),
            db.query(trendQuery)
        ]);
        
        const stats = {};
        statsResult.rows.forEach(row => {
            stats[row.type] = parseInt(row.count);
        });

        res.status(200).json({
            success: true,
            data: {
                summary: [
                    { label: 'Customers', value: stats.customers || 0, icon: 'Users', trend: '+12%' },
                    { label: 'Vendors', value: stats.vendors || 0, icon: 'Briefcase', trend: '+5%' },
                    { label: 'Leads', value: stats.leads || 0, icon: 'FileDigit', trend: '+18%' },
                    { label: 'Active Subs', value: stats.subscriptions || 0, icon: 'Calendar', trend: '+7%' }
                ],
                topVendors: topVendors.rows,
                recentActivity: recentActivity.rows,
                leadsTrend: trendData.rows
            }
        });
    } catch (error) {
        console.error('[ERROR] /admin/stats:', error);
        next(error);
    }
};

module.exports = { getStats };
