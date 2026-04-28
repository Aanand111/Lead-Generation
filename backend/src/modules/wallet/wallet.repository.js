const { pool } = require('../../config/db');

class WalletRepository {
    async getBalance(userId, client = pool) {
        const result = await client.query('SELECT wallet_balance FROM users WHERE id = $1', [userId]);
        return result.rows[0]?.wallet_balance || 0;
    }

    async creditBalance(userId, amount, client = pool) {
        const result = await client.query(
            'UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2 RETURNING wallet_balance',
            [amount, userId]
        );

        return result.rows[0]?.wallet_balance ?? null;
    }

    async debitBalance(userId, amount, client = pool) {
        const result = await client.query(
            `UPDATE users
             SET wallet_balance = wallet_balance - $1
             WHERE id = $2 AND wallet_balance >= $1
             RETURNING wallet_balance`,
            [amount, userId]
        );

        return result.rows[0]?.wallet_balance ?? null;
    }

    async createTransaction(transactionData, client = pool) {
        const { user_id, type, amount, credits, status, remarks, reference_id } = transactionData;
        const result = await client.query(
            `INSERT INTO transactions (user_id, type, amount, credits, status, remarks, reference_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [user_id, type, amount || 0, credits || 0, status || 'COMPLETED', remarks, reference_id || null]
        );
        return result.rows[0];
    }
}

module.exports = new WalletRepository();
