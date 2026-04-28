const { pool } = require('../config/db');

/**
 * Transaction Helper
 * Ensures all DB operations within the callback are executed in a single transaction.
 * Automatically handles BEGIN, COMMIT, and ROLLBACK.
 */
const withTransaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = { withTransaction };
