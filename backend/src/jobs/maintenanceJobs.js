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
            for (const poster of expiredPostersRes.rows) {
                await NotificationService.sendPushToUser(
                    poster.phone,
                    'Poster Expired & Archived',
                    `Your poster "${poster.title}" has reached its validity limit and is now archived.`
                );
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
            for (const sub of expiringRes.rows) {
                await NotificationService.sendPushToUser(
                    sub.phone,
                    'Package Expiring Soon!',
                    `Your "${sub.plan_name}" plan will expire on ${new Date(sub.end_date).toLocaleDateString()}. Renew now to continue enjoying leads!`
                );
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

const syncAllVendorsRegistry = async () => {
    try {
        logger.info('[JOBS] Starting vendor registry synchronization');

        const activeVendorsRes = await pool.query(
            "SELECT id, phone, email, full_name, password_hash, referral_code, status, referred_by FROM users WHERE role = 'vendor'"
        );

        logger.info('[JOBS] Vendor registry scan loaded', {
            vendorCount: activeVendorsRes.rowCount
        });

        for (const user of activeVendorsRes.rows) {
            let vendorStatus = 'Active';
            if (user.status && user.status.toUpperCase() === 'PENDING') vendorStatus = 'Pending';
            if (user.status && user.status.toUpperCase() === 'BLOCKED') vendorStatus = 'Inactive';

            const regRes = await pool.query(
                'SELECT id FROM vendors WHERE phone = $1 OR email = $2 LIMIT 1',
                [user.phone, user.email]
            );

            if (regRes.rows.length === 0) {
                logger.info('[JOBS] Backfilling vendor registry entry', {
                    fullName: user.full_name,
                    userId: user.id
                });

                await pool.query(
                    `INSERT INTO vendors (name, phone, email, password, referral_code, status)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [user.full_name, user.phone, user.email, user.password_hash, user.referral_code, vendorStatus]
                );
            }
        }

        logger.info('[JOBS] Synchronizing vendor hierarchy links');
        const syncLinksRes = await pool.query(`
            UPDATE vendors v
            SET referred_by_vendor_id = parent_vendor.id
            FROM users child_user
            JOIN users parent_user ON child_user.referred_by = parent_user.id
            JOIN vendors parent_vendor ON parent_user.phone = parent_vendor.phone
            WHERE v.phone = child_user.phone
            AND v.referred_by_vendor_id IS NULL
        `);

        logger.info('[JOBS] Vendor registry synchronization completed', {
            updatedLinks: syncLinksRes.rowCount
        });
    } catch (error) {
        logger.error('[JOBS] Vendor registry synchronization failed', {
            message: error.message,
            stack: error.stack
        });
    }
};

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

const runAllMaintenanceTasks = async () => {
    logger.info('[JOBS] Initiating manual maintenance sequence');
    await archiveExpiredPosters();
    await expirePurchasedLeads();
    await checkPackageRenewals();
    await syncAllVendorsRegistry();
    await refreshAnalyticsView();
    logger.info('[JOBS] Manual maintenance sequence completed');
};

module.exports = {
    archiveExpiredPosters,
    expirePurchasedLeads,
    checkPackageRenewals,
    syncAllVendorsRegistry,
    refreshAnalyticsView,
    runAllMaintenanceTasks
};
