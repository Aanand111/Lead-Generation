const { pool } = require('../config/db');

/**
 * processCommission - Calculates and records commission for a purchase
 * @param {string} userId - The user who made the purchase
 * @param {number} purchaseAmount - The total value of the purchase
 * @param {string} remarks - Descriptive remark for the transaction (e.g., "Subscription Plan: Basic")
 */
const processCommission = async (userId, purchaseAmount, remarks) => {
    try {
        // 1. Find if the user was referred by a vendor
        const userRes = await pool.query(
            'SELECT referred_by FROM users WHERE id = $1',
            [userId]
        );
        
        const referrerId = userRes.rows[0]?.referred_by;
        if (!referrerId) {
            console.log(`[COMMISSION] Skip: User ${userId} has no referrer.`);
            return;
        }

        // 2. Fetch Referrer (Vendor) details to get their custom rate
        const vendorRes = await pool.query(
            'SELECT id, role, custom_commission_rate FROM users WHERE id = $1',
            [referrerId]
        );
        
        const vendor = vendorRes.rows[0];
        if (!vendor || vendor.role !== 'vendor') {
            console.log(`[COMMISSION] Skip: Referrer ${referrerId} is not a valid vendor node.`);
            return;
        }

        // 3. Get the Commission Rate (Logic: Individual Override -> Global Protocol)
        let commissionRate = vendor.custom_commission_rate;
        let mode = 'CUSTOM_OVERRIDE';
        
        if (commissionRate === null || commissionRate === undefined) {
            // Use global setting if custom isn't set
            const settingRes = await pool.query(
                "SELECT setting_value FROM system_settings WHERE setting_key = 'referral_vendor_commission_rate'"
            );
            commissionRate = parseFloat(settingRes.rows[0]?.setting_value || 5); // Default to 5% if setting missing
            mode = 'GLOBAL_PROTOCOL';
        } else {
             commissionRate = parseFloat(commissionRate);
        }

        // 4. Calculate Amount
        const commissionAmount = (purchaseAmount * commissionRate) / 100;

        if (commissionAmount <= 0) {
            console.log(`[COMMISSION] Skip: Calculated amount is zero.`);
            return;
        }

        // 5. Record the transaction in the ledger
        // Initially PENDING: Requires Admin Approval before it moves to COMPLETED status and reflects in cleared earnings.
        await pool.query(
            `INSERT INTO commission_transactions (vendor_id, amount, status, remarks, type) 
             VALUES ($1, $2, 'PENDING', $3, 'REFERRAL_COMMISSION')`,
            [referrerId, commissionAmount, remarks]
        );

        console.log(`[COMMISSION] Success: Processed for Vendor ${referrerId} | Amount: ₹${commissionAmount} | Mode: ${mode} (${commissionRate}%) | Context: ${remarks}`);
        
    } catch (error) {
        console.error('[COMMISSION SERVICE CRITICAL]:', error);
        // We don't throw here to ensure the core purchase flow (e.g. subscription activation) doesn't fail due to commission logic errors.
    }
};

module.exports = { processCommission };
