const { pool } = require('../config/db');

const NotificationService = require('../services/notificationService');

/**
 * Job: Auto-archive expired posters
 * logic: Set status to 'Archived' for user posters where expiry_date < NOW()
 */
const archiveExpiredPosters = async () => {
    try {
        console.log('[JOBS] Starting Poster Expiry Analysis...');
        
        // 1. Fetch soon-to-be archived posters to notify users
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
                // Send notification
                await NotificationService.sendPushToUser(
                    poster.phone,
                    'Poster Expired & Archived',
                    `Your poster "${poster.title}" has reached its validity limit and is now archived.`
                );
            }
        }

        // 2. Perform the update
        const result = await pool.query(
            `UPDATE posters 
             SET status = 'Archived', updated_at = NOW() 
             WHERE expiry_date < NOW() 
             AND status != 'Archived' 
             AND user_id IS NOT NULL 
             RETURNING id`
        );
        console.log(`[JOBS] Successfully archived ${result.rowCount} expired posters.`);
    } catch (error) {
        console.error('[JOBS ERROR] Poster Archiving failed:', error);
    }
};

/**
 * Job: Expire old leads / subscription tokens
 * logic: Marked user lead acquisitions as 'EXPIRED' after 30 days (default)
 */
const expirePurchasedLeads = async () => {
    try {
        console.log('[JOBS] Starting Lead Expiry Cleanup...');
        const result = await pool.query(
            `UPDATE lead_purchases 
             SET status = 'EXPIRED' 
             WHERE purchase_date < (NOW() - INTERVAL '30 days') 
             AND status = 'ACQUIRED' 
             RETURNING id`
        );
        console.log(`[JOBS] Successfully expired ${result.rowCount} purchased leads.`);
    } catch (error) {
        console.error('[JOBS ERROR] Lead Expiry failed:', error);
    }
};

/**
 * Job: Remind users about package renewal
 * logic: Notify users whose subscription expires in 2 days
 */
const checkPackageRenewals = async () => {
    try {
        console.log('[JOBS] Starting Package Renewal Reminders...');
        
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
                    'Package Expiring Soon! ⏳',
                    `Your "${sub.plan_name}" plan will expire on ${new Date(sub.end_date).toLocaleDateString()}. Renew now to continue enjoying leads!`
                );
            }
        }
        console.log(`[JOBS] Sent renewal reminders to ${expiringRes.rowCount} users.`);
    } catch (error) {
        console.error('[JOBS ERROR] Package Renewal Check failed:', error);
    }
};

/**
 * Job: Sync Missing Vendors to Registry
 * logic: Backfills 'vendors' table from 'users' table specifically for vendors 
 * registered before the sync middleware was implemented.
 */
const syncAllVendorsRegistry = async () => {
    try {
        console.log('[JOBS] Starting Robust Vendor Registry Synchronization...');
        
        // 1. Fetch ALL vendors (Active or Pending) ignoring exact case
        const activeVendorsRes = await pool.query(
            "SELECT id, phone, email, full_name, password_hash, referral_code, status, referred_by FROM users WHERE role = 'vendor'"
        );

        console.log(`[JOBS] Analyzing ${activeVendorsRes.rowCount} vendors for synchronization.`);

        for (const user of activeVendorsRes.rows) {
            // Ensure status strings align properly
            let vendorStatus = 'Active';
            if (user.status && user.status.toUpperCase() === 'PENDING') vendorStatus = 'Pending';
            if (user.status && user.status.toUpperCase() === 'BLOCKED') vendorStatus = 'Inactive';

            // Check if already in vendors table
            const regRes = await pool.query('SELECT id FROM vendors WHERE phone = $1 OR email = $2 LIMIT 1', [user.phone, user.email]);
            
            if (regRes.rows.length === 0) {
                // MISSING: Create new registry entry
                console.log(`[SYNC] Backfilling registry entry for: ${user.full_name}`);
                await pool.query(
                    `INSERT INTO vendors (name, phone, email, password, referral_code, status) 
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [user.full_name, user.phone, user.email, user.password_hash, user.referral_code, vendorStatus]
                );
            }
        }

        // 2. Establish Hierarchical Links accurately using proper joins
        console.log('[JOBS] Establishing accurate hierarchical links in registry...');
        const syncLinksRes = await pool.query(`
            UPDATE vendors v
            SET referred_by_vendor_id = parent_vendor.id
            FROM users child_user
            JOIN users parent_user ON child_user.referred_by = parent_user.id
            JOIN vendors parent_vendor ON parent_user.phone = parent_vendor.phone
            WHERE v.phone = child_user.phone 
            AND v.referred_by_vendor_id IS NULL
        `);

        console.log(`[JOBS] Vendor Registry Sync Completed. Links updated: ${syncLinksRes.rowCount}`);
    } catch (error) {
        console.error('[JOBS ERROR] Vendor Registry Sync failed:', error);
    }
};
/**
 * Manual Trigger for all maintenance tasks
 */
const runAllMaintenanceTasks = async () => {
    console.log('[JOBS] Initiating Manual Maintenance Sequence...');
    await archiveExpiredPosters();
    await expirePurchasedLeads();
    await checkPackageRenewals();
    await syncAllVendorsRegistry();
    console.log('[JOBS] Manual Maintenance Sequence Completed.');
};

module.exports = {
    archiveExpiredPosters,
    expirePurchasedLeads,
    checkPackageRenewals,
    syncAllVendorsRegistry,
    runAllMaintenanceTasks
};
