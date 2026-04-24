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

        // 2. Fetch Referrer details
        const referrerRes = await pool.query(
            'SELECT id, role, custom_commission_rate, wallet_balance FROM users WHERE id = $1',
            [referrerId]
        );
        
        const referrer = referrerRes.rows[0];
        if (!referrer) {
            console.log(`[COMMISSION] Skip: Referrer node ${referrerId} not found.`);
            return;
        }

        // 3. Resolve Commission Rate
        let commissionRate = referrer.custom_commission_rate;
        if (!commissionRate) {
            const key = referrer.role === 'vendor' ? 'referral_vendor_commission_rate' : 'referral_user_commission_rate';
            const settingRes = await pool.query(
                "SELECT setting_value FROM system_settings WHERE setting_key = $1",
                [key]
            );
            commissionRate = parseFloat(settingRes.rows[0]?.setting_value || (referrer.role === 'vendor' ? 5 : 2));
        } else {
            commissionRate = parseFloat(commissionRate);
        }

        // 4. Calculate Commission
        const commissionAmount = parseFloat(((purchaseAmount * commissionRate) / 100).toFixed(2));
        if (commissionAmount <= 0) return;

        // 5. Award Commission based on Role
        if (referrer.role === 'vendor') {
            // Vendors get PENDING commission transactions for audit
            await pool.query(
                `INSERT INTO commission_transactions (vendor_id, amount, status, remarks, type) 
                 VALUES ($1, $2, 'PENDING', $3, 'REFERRAL_COMMISSION')`,
                [referrerId, commissionAmount, remarks]
            );
        } else {
            // Standard Users get DIRECT wallet credits and record in referrals table
            await pool.query(
                'UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2',
                [commissionAmount, referrerId]
            );

            // Record transaction for the user
            await pool.query(
                'INSERT INTO transactions (user_id, type, amount, credits, status, remarks) VALUES ($1, $2, 0, $3, $4, $5)',
                [referrerId, 'REFERRAL_REWARD', commissionAmount, 'COMPLETED', `Bonus from node purchase: ${remarks}`]
            );

            // Update the specific referral record if it exists
            await pool.query(
                'UPDATE referrals SET commission_earned = commission_earned + $1 WHERE referrer_id = $2 AND referred_user_id = $3',
                [commissionAmount, referrerId, userId]
            );
        }

        console.log(`[COMMISSION] Success: Transaction logged for Vendor ${referrerId}`);
        return commissionAmount;

    } catch (error) {
        console.error('[COMMISSION SERVICE CRITICAL FAILURE]:', error);
    }
};

module.exports = { processCommission };
