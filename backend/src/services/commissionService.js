const { pool } = require('../config/db');
const logger = require('../utils/logger');

/**
 * processCommission - Calculates and records commission for a purchase.
 *
 * All DB writes (wallet credit, transaction log, referral update) run inside a
 * single atomic transaction — either everything succeeds or everything rolls back.
 * This prevents partial-write scenarios (e.g. wallet credited but log missing).
 *
 * @param {string} userId         - The user who made the purchase
 * @param {number} purchaseAmount - The total value of the purchase (INR)
 * @param {string} remarks        - Descriptive remark (e.g. "Subscription Plan: Basic")
 * @returns {number|undefined}    - Commission amount awarded, or undefined if skipped
 */
const processCommission = async (userId, purchaseAmount, remarks) => {
    const client = await pool.connect();

    try {
        logger.info('[COMMISSION] Initiating commission calculation', {
            userId,
            purchaseAmount
        });

        // ── Step 1: Resolve referrer ──────────────────────────────────────────
        const userRes = await client.query(
            'SELECT referred_by FROM users WHERE id = $1',
            [userId]
        );

        const referrerId = userRes.rows[0]?.referred_by;
        if (!referrerId) {
            logger.info('[COMMISSION] Skipped: user has no referrer', { userId });
            return;
        }

        // ── Step 2: Fetch referrer details ────────────────────────────────────
        const referrerRes = await client.query(
            'SELECT id, role, custom_commission_rate FROM users WHERE id = $1',
            [referrerId]
        );

        const referrer = referrerRes.rows[0];
        if (!referrer) {
            logger.warn('[COMMISSION] Skipped: referrer not found', { referrerId });
            return;
        }

        // ── Step 3: Resolve commission rate ───────────────────────────────────
        let commissionRate = referrer.custom_commission_rate
            ? parseFloat(referrer.custom_commission_rate)
            : null;

        if (!commissionRate) {
            const rateKey = referrer.role === 'vendor'
                ? 'referral_vendor_commission_rate'
                : 'referral_user_commission_rate';
            const defaultRate = referrer.role === 'vendor' ? 5 : 2;

            const settingRes = await client.query(
                'SELECT setting_value FROM system_settings WHERE setting_key = $1',
                [rateKey]
            );
            commissionRate = parseFloat(settingRes.rows[0]?.setting_value || defaultRate);
        }

        // ── Step 4: Calculate amount ──────────────────────────────────────────
        const commissionAmount = parseFloat(((purchaseAmount * commissionRate) / 100).toFixed(2));
        if (commissionAmount <= 0) {
            logger.info('[COMMISSION] Skipped: calculated amount is zero', { commissionRate, purchaseAmount });
            return;
        }

        // ── Step 5: Begin atomic transaction ──────────────────────────────────
        await client.query('BEGIN');

        if (referrer.role === 'vendor') {
            // Vendors → PENDING commission entry (reviewed before payout)
            await client.query(
                `INSERT INTO commission_transactions
                     (vendor_id, amount, status, remarks, type)
                 VALUES ($1, $2, 'PENDING', $3, 'REFERRAL_COMMISSION')`,
                [referrerId, commissionAmount, remarks]
            );
        } else {
            // Regular users → direct wallet credit + transaction log + referral update
            await client.query(
                'UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2',
                [commissionAmount, referrerId]
            );

            await client.query(
                `INSERT INTO transactions
                     (user_id, type, amount, credits, status, remarks)
                 VALUES ($1, 'REFERRAL_REWARD', 0, $2, 'COMPLETED', $3)`,
                [referrerId, commissionAmount, `Referral bonus: ${remarks}`]
            );

            // Best-effort update — row may not exist yet, that is fine
            await client.query(
                `UPDATE referrals
                 SET commission_earned = commission_earned + $1
                 WHERE referrer_id = $2 AND referred_user_id = $3`,
                [commissionAmount, referrerId, userId]
            );
        }

        await client.query('COMMIT');

        logger.info('[COMMISSION] Commission recorded successfully', {
            referrerId,
            referrerRole: referrer.role,
            commissionAmount
        });

        return commissionAmount;

    } catch (error) {
        // Roll back every partial write if anything fails
        await client.query('ROLLBACK').catch(() => {});
        logger.error('[COMMISSION] Transaction rolled back due to error', {
            userId,
            purchaseAmount,
            message: error.message
        });
        throw error; // Re-throw so callers can decide how to handle
    } finally {
        client.release();
    }
};

/**
 * processCommissionAsync - Fire-and-forget wrapper.
 *
 * Use this when the commission result does NOT need to block the HTTP response
 * (e.g. after a Razorpay payment has already been committed). Errors are logged
 * but do NOT propagate to the caller.
 *
 * @param {string} userId
 * @param {number} purchaseAmount
 * @param {string} remarks
 */
const processCommissionAsync = (userId, purchaseAmount, remarks) => {
    processCommission(userId, purchaseAmount, remarks).catch((err) => {
        logger.error('[COMMISSION] Async commission processing failed (non-blocking)', {
            userId,
            purchaseAmount,
            message: err.message
        });
    });
};

module.exports = { processCommission, processCommissionAsync };
