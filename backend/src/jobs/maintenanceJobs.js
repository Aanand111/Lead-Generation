const { pool } = require('../config/db');
const NotificationService = require('../services/notificationService');
const logger = require('../utils/logger');

const archiveExpiredPosters = async () => {
    try {
        logger.info('[JOBS] Starting poster expiry analysis');

        const expiredPostersRes = await pool.query(
            `SELECT p.id, p.title, p.user_id, u.phone
             FROM posters p
             JOIN users u ON p.user_id = u.id
             WHERE p.expiry_date < NOW()
             AND p.status != 'Archived'
             AND p.user_id IS NOT NULL`
        );

        if (expiredPostersRes.rows.length > 0) {
            const batchSize = 50;
            for (let i = 0; i < expiredPostersRes.rows.length; i += batchSize) {
                const batch = expiredPostersRes.rows.slice(i, i + batchSize);
                await Promise.allSettled(batch.map(poster =>
                    NotificationService.sendPushToUser(
                        poster.phone,
                        'Poster Expired & Archived',
                        `Your poster "${poster.title}" has reached its validity limit and is now archived.`
                    )
                ));
            }
        }

        const result = await pool.query(
            `UPDATE posters
             SET status = 'Archived', updated_at = NOW()
             WHERE expiry_date < NOW()
             AND status != 'Archived'
             AND user_id IS NOT NULL
             RETURNING id`
        );

        logger.info('[JOBS] Poster archiving completed', { archivedCount: result.rowCount });
    } catch (error) {
        logger.error('[JOBS] Poster archiving failed', {
            message: error.message,
            stack: error.stack
        });
    }
};

const expirePurchasedLeads = async () => {
    try {
        logger.info('[JOBS] Starting lead expiry cleanup');
        const result = await pool.query(
            `UPDATE lead_purchases
             SET status = 'EXPIRED'
             WHERE purchase_date < (NOW() - INTERVAL '30 days')
             AND status = 'ACQUIRED'
             RETURNING id`
        );

        logger.info('[JOBS] Lead expiry cleanup completed', { expiredCount: result.rowCount });
    } catch (error) {
        logger.error('[JOBS] Lead expiry cleanup failed', {
            message: error.message,
            stack: error.stack
        });
    }
};

const checkPackageRenewals = async () => {
    try {
        logger.info('[JOBS] Starting package renewal reminders');

        const expiringRes = await pool.query(
            `SELECT s.id, s.user_id, s.end_date, u.phone, sp.name as plan_name
             FROM subscriptions s
             JOIN users u ON s.user_id = u.id
             JOIN subscription_plans sp ON s.plan_id = sp.id
             WHERE s.end_date > NOW()
             AND s.end_date <= (NOW() + INTERVAL '2 days')
             AND s.status = 'Active'`
        );

        if (expiringRes.rows.length > 0) {
            const batchSize = 50;
            for (let i = 0; i < expiringRes.rows.length; i += batchSize) {
                const batch = expiringRes.rows.slice(i, i + batchSize);
                await Promise.allSettled(batch.map(sub =>
                    NotificationService.sendPushToUser(
                        sub.phone,
                        'Package Expiring Soon!',
                        `Your "${sub.plan_name}" plan will expire on ${new Date(sub.end_date).toLocaleDateString()}. Renew now to continue enjoying leads!`
                    )
                ));
            }
        }

        logger.info('[JOBS] Package renewal reminders completed', {
            notifiedUsers: expiringRes.rowCount
        });
    } catch (error) {
        logger.error('[JOBS] Package renewal reminders failed', {
            message: error.message,
            stack: error.stack
        });
    }
};

// syncAllVendorsRegistry has been completely removed as part of the architecture refactor.
// Vendors are now solely managed natively in the users table, eliminating dual-table redundancy.

const refreshAnalyticsView = async () => {
    try {
        logger.info('[JOBS] Refreshing analytics materialized views');
        await pool.query('SELECT refresh_user_stats()');
        logger.info('[JOBS] Analytics materialized views refreshed');
    } catch (error) {
        logger.error('[JOBS] Analytics refresh failed', {
            message: error.message,
            stack: error.stack
        });
    }
};

const cleanupPendingTransactions = async () => {
    try {
        logger.info('[JOBS] Starting pending transaction cleanup');
        const result = await pool.query(
            `UPDATE transactions
             SET status = 'FAILED', remarks = 'Transaction timed out / abandoned by user'
             WHERE status = 'PENDING'
             AND created_at < (NOW() - INTERVAL '2 hours')
             RETURNING id`
        );
        logger.info('[JOBS] Pending transaction cleanup completed', { cleanedCount: result.rowCount });
    } catch (error) {
        logger.error('[JOBS] Pending transaction cleanup failed', {
            message: error.message,
            stack: error.stack
        });
    }
};

const runAllMaintenanceTasks = async () => {
    logger.info('[JOBS] Initiating manual maintenance sequence');
    await archiveExpiredPosters();
    await expirePurchasedLeads();
    await checkPackageRenewals();
    await refreshAnalyticsView();
    await cleanupPendingTransactions();
    logger.info('[JOBS] Manual maintenance sequence completed');
};

module.exports = {
    archiveExpiredPosters,
    expirePurchasedLeads,
    checkPackageRenewals,
    refreshAnalyticsView,
    cleanupPendingTransactions,
    runAllMaintenanceTasks
};
