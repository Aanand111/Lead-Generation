const Razorpay = require('razorpay');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { processCommission } = require('../services/commissionService');

// @desc    Initialize Razorpay Instance
// @note    Using dynamic initialization to ensure .env changes are picked up
const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || key_id === 'rzp_test_your_id') {
        const error = new Error('RAZORPAY_KEY_ID is missing or set to placeholder in .env. Please update it with your actual keys from the Razorpay dashboard.');
        error.status = 401; // Specific status for our internal logic to detect key issues
        throw error;
    }

    return new Razorpay({
        key_id,
        key_secret,
    });
};

// @desc    Create Razorpay Order for Subscription
// @route   POST /api/user/subscription/create-order
// @access  Private
const createSubscriptionOrder = async (req, res, next) => {
    try {
        const { planId, name, email, phone, address, panNumber } = req.body;
        const userId = req.user.id;

        // 1. Validate Plan
        const planRes = await pool.query('SELECT * FROM subscription_plans WHERE id = $1 AND status = $2', [planId, 'Active']);
        if (!planRes.rows[0]) {
            return res.status(404).json({ success: false, message: 'Plan not found or inactive.' });
        }
        const plan = planRes.rows[0];

        // 2. Initialize Razorpay and Create Order 
        let razorpay;
        try {
            razorpay = getRazorpayInstance();
        } catch (initErr) {
            return res.status(500).json({ 
                success: false, 
                message: initErr.message,
                hint: 'Update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your backend/.env file.'
            });
        }

        const options = {
            amount: Math.round(plan.price * 100), // convert to paise
            currency: 'INR',
            receipt: `sub_${Date.now()}_${userId.slice(0, 8)}`,
        };

        const order = await razorpay.orders.create(options);

        // 3. Log Pending Transaction
        await pool.query(
            'INSERT INTO transactions (user_id, type, amount, status, reference_id, remarks) VALUES ($1, $2, $3, $4, $5, $6)',
            [userId, 'PURCHASE', plan.price, 'PENDING', order.id, JSON.stringify({ planId, name, email, phone, address, panNumber })]
        );

        res.status(200).json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID,
            user: { name, email, phone, address }
        });

    } catch (error) {
        console.error('Create Subscription Order Error:', error);
        
        // Handle Razorpay Authentication Errors (401 from Gateway)
        if (error.statusCode === 401) {
            return res.status(500).json({
                success: false,
                message: 'Razorpay Gateway Authentication Failed. Your API keys are invalid.',
                details: 'The Razorpay server returned a 401. Please verify your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the .env file.'
            });
        }
        
        next(error);
    }
};

// @desc    Verify Payment and Activate Plan
// @route   POST /api/user/subscription/verify-payment
// @access  Private
const verifySubscriptionPayment = async (req, res, next) => {
    const client = await pool.connect();
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const userId = req.user.id;
        const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!razorpaySecret) {
            return res.status(500).json({
                success: false,
                message: 'Razorpay is not configured correctly on the server.'
            });
        }

        // 1. Verify Razorpay Signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", razorpaySecret)
            .update(sign.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification failed." });
        }

        // 2. Transact (Credits + Subscription + Transaction Update)
        await client.query('BEGIN');

        // Check if already processed
        const existingTx = await client.query('SELECT status FROM transactions WHERE transaction_id = $1', [razorpay_payment_id]);
        if (existingTx.rows.length > 0 && (existingTx.rows[0].status === 'SUCCESS' || existingTx.rows[0].status === 'COMPLETED')) {
            await client.query('COMMIT');
            return res.json({ success: true, message: 'Already processed' });
        }

        // Find Pending Transaction
        const transRes = await client.query(
            'SELECT * FROM transactions WHERE reference_id = $1 AND status = $2 FOR UPDATE',
            [razorpay_order_id, 'PENDING']
        );
        if (!transRes.rows[0]) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: "Transaction context lost." });
        }

        const trans = transRes.rows[0];
        const { planId, name, email, address, panNumber } = JSON.parse(trans.remarks);

        // Fetch Plan metadata
        const planRes = await client.query('SELECT * FROM subscription_plans WHERE id = $1', [planId]);
        const plan = planRes.rows[0];

        // Award Credits & Update Profile (Persist Email/Address/PAN gathered)
        const creditsToAward = parseInt(plan.credits || 0);
        await client.query(
            'UPDATE users SET wallet_balance = wallet_balance + $1, full_name = $2, email = $3, address = $4 WHERE id = $5', 
            [creditsToAward, name, email, address, userId]
        );

        // Update user_profiles with PAN
        await client.query(
            `INSERT INTO user_profiles (user_id, pan_number) 
             VALUES ($1, $2) 
             ON CONFLICT (user_id) DO UPDATE SET pan_number = EXCLUDED.pan_number`,
            [userId, panNumber]
        );

        // Activate Subscription Record
        const durationStr = plan.duration + ' days';
        await client.query(
            `INSERT INTO subscriptions (user_id, plan_id, total_leads, total_posters, status, start_date, end_date) 
             VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_DATE + $6::INTERVAL)`,
            [userId, planId, plan.leads_limit, plan.poster_limit, 'Active', durationStr]
        );

        // Finalize Transaction
        await client.query(
            'UPDATE transactions SET status = $1, transaction_id = $2, payment_gateway = $3, remarks = $4 WHERE id = $5',
            ['COMPLETED', razorpay_payment_id, 'RAZORPAY', `Activated: ${plan.name} (PAN: ${panNumber || 'N/A'})`, trans.id]
        );

        await client.query('COMMIT');

        // Real-time Wallet Refresh
        try {
            const { sendToUser } = require('../utils/socket');
            const updatedUser = await pool.query('SELECT wallet_balance FROM users WHERE id = $1', [userId]);
            sendToUser(userId, 'wallet_update', { wallet_balance: updatedUser.rows[0].wallet_balance });
        } catch (sErr) {
            console.error('[SOCKET ERROR] Failed to send balance update:', sErr.message);
        }
        
        // --- ASYNC COMMISSION PROCESSING ---
        // We trigger it after commit to ensure the core payment process is finalized.
        try {
            if (plan.price > 0) {
                await processCommission(userId, parseFloat(plan.price), `Package Purchase: ${plan.name} (via Razorpay)`);
            }
        } catch (commErr) {
            console.error('[CRITICAL] Commission trigger failed after successful payment:', commErr);
        }

        res.status(200).json({
            success: true,
            message: `Plan ${plan.name} activated successfully!`
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Payment Verification Error:', error);
        next(error);
    } finally {
        client.release();
    }
};

module.exports = {
    createSubscriptionOrder,
    verifySubscriptionPayment
};
