const db = require('../config/db');

// ── GET all transactions (with user & plan info) ──────────────────
const getTransactions = async (req, res, next) => {
    try {
        const { status, type, user_id } = req.query;

        let query = `
            SELECT 
                t.*,
                COALESCE(u.full_name, c.name, u.phone, c.phone, c.email, 'User') AS display_name,
                u.full_name AS user_name,
                u.phone     AS user_phone,
                c.name      AS customer_name,
                c.phone     AS customer_phone,
                c.email     AS customer_email,
                sp.name     AS plan_name,
                p.name      AS package_name
            FROM transactions t
            LEFT JOIN users u ON u.id::text = t.user_id::text
            LEFT JOIN customers c ON c.id::text = t.user_id::text
            LEFT JOIN subscription_plans sp ON sp.id::text = t.reference_id
            LEFT JOIN packages p ON p.id::text = t.reference_id
        `;

        const params = [];
        const conditions = [];

        if (status) {
            params.push(status);
            conditions.push(`t.status = $${params.length}`);
        }
        if (type) {
            params.push(type);
            conditions.push(`t.type = $${params.length}`);
        }
        if (user_id) {
            params.push(user_id);
            conditions.push(`t.user_id = $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        query += ` ORDER BY t.created_at DESC`;

        const result = await db.query(query, params);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
};

// ── GET single transaction ────────────────────────────────────────
const getTransactionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                t.*,
                u.full_name AS user_name,
                sp.name AS plan_name,
                p.name AS package_name
            FROM transactions t
            LEFT JOIN users u ON u.id = t.user_id
            LEFT JOIN subscription_plans sp ON sp.id::text = t.reference_id
            LEFT JOIN packages p ON p.id::text = t.reference_id
            WHERE t.id = $1
        `;
        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

// ── Record a manual payment (Optional, but useful for Admin) ──────
const createTransaction = async (req, res, next) => {
    try {
        const { 
            user_id, type, amount, credits, 
            payment_method, transaction_id, status, 
            reference_id, remarks 
        } = req.body;

        const result = await db.query(
            `INSERT INTO transactions 
                (user_id, type, amount, credits, payment_method, transaction_id, status, reference_id, remarks)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [
                user_id, type || 'PURCHASE', amount || 0, credits || 0,
                payment_method || 'Manual', transaction_id, status || 'COMPLETED',
                reference_id, remarks
            ]
        );

        res.status(201).json({ success: true, message: 'Transaction recorded', data: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

// ── PAYOUT MANAGEMENT ──────────────────────────────────────────────
const getPayouts = async (req, res, next) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT 
                ct.*,
                v.name as vendor_name,
                v.phone as vendor_phone,
                v.email as vendor_email
            FROM commission_transactions ct
            JOIN vendors v ON v.id = ct.vendor_id
            WHERE ct.type = 'PAYOUT'
        `;
        const params = [];
        if (status) {
            params.push(status);
            query += ` AND ct.status = $1`;
        }
        query += ` ORDER BY ct.created_at DESC`;

        const result = await db.query(query, params);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
};

const updatePayoutStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, remarks, payment_reference } = req.body;

        const result = await db.query(
            `UPDATE commission_transactions 
             SET status = $1, remarks = $2, payment_reference = $3, payment_date = CASE WHEN $1 = 'COMPLETED' THEN NOW() ELSE payment_date END, updated_at = NOW()
             WHERE id = $4 AND type = 'PAYOUT'
             RETURNING *`,
            [status, remarks, payment_reference, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Payout request not found' });
        }

        res.status(200).json({ success: true, message: `Payout marked as ${status}`, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTransactions,
    getTransactionById,
    createTransaction,
    getPayouts,
    updatePayoutStatus
};
