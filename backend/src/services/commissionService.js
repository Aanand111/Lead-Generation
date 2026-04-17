const { pool } = require('../config/db');

/**
 * processCommission - Calculates and records commission for a purchase
 * @param {string} userId - The user who made the purchase
 * @param {number} purchaseAmount - The total value of the purchase
 * @param {string} remarks - Descriptive remark for the transaction (e.g., "Subscription Plan: Basic")
 */
const processCommission = async (userId, purchaseAmount, remarks) => {
    try {
        console.log(`[COMMISSION DEBUG] Initiating calculation for User: ${userId} | Purchase: ₹${purchaseAmount}`);
        
        // 1. Find if the user was referred by a vendor
        const userRes = await pool.query(
            'SELECT referred_by FROM users WHERE id = $1',
            [userId]
        );
        
        const referrerId = userRes.rows[0]?.referred_by;
        if (!referrerId) {
            console.log(`[COMMISSION] Skip: User ${userId} has no referrer node.`);
            return;
        }

        // 2. Fetch Referrer (Vendor) details
        const vendorRes = await pool.query(
            'SELECT id, role, custom_commission_rate FROM users WHERE id = $1',
            [referrerId]
        );
        
        const vendor = vendorRes.rows[0];
        if (!vendor || vendor.role !== 'vendor') {
            console.log(`[COMMISSION] Skip: Referrent ${referrerId} is not a vendor role (Found: ${vendor?.role}).`);
            return;
        }

        // 3. Resolve Commission Rate (Priority: Local Override -> Global Protocol)
        let commissionRate = vendor.custom_commission_rate;
        let strategy = 'LOCAL_OVERRIDE';

        if (commissionRate === null || commissionRate === undefined || commissionRate === '') {
            const settingRes = await pool.query(
                "SELECT setting_value FROM system_settings WHERE setting_key = 'referral_vendor_commission_rate'"
            );
            commissionRate = parseFloat(settingRes.rows[0]?.setting_value || 5);
            strategy = 'GLOBAL_PROTOCOL';
        } else {
            commissionRate = parseFloat(commissionRate);
        }

        // 4. Execute Calculation
        const commissionAmount = parseFloat(((purchaseAmount * commissionRate) / 100).toFixed(2));

        console.log(`[COMMISSION] Resolved Rate: ${commissionRate}% | Strategy: ${strategy} | Result: ₹${commissionAmount}`);

        if (commissionAmount <= 0) {
            console.log(`[COMMISSION] Skip: Resulting credit is zero.`);
            return;
        }

        // 5. Record in Ledger (PENDING status for Audit)
        await pool.query(
            `INSERT INTO commission_transactions (vendor_id, amount, status, remarks, type) 
             VALUES ($1, $2, 'PENDING', $3, 'REFERRAL_COMMISSION')`,
            [referrerId, commissionAmount, remarks]
        );

        console.log(`[COMMISSION] Success: Transaction logged for Vendor ${referrerId}`);
        return commissionAmount;

    } catch (error) {
        console.error('[COMMISSION SERVICE CRITICAL FAILURE]:', error);
    }
};

module.exports = { processCommission };
