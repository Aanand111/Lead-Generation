const { pool } = require('../config/db');

/**
 * BulkJobProcessor: Efficiently processes large datasets (1M+ users) 
 * using batching and non-blocking job runs.
 */
class BulkJobProcessor {
    /**
     * processUsersInBatches: Fetches users in chunks and executes a handler.
     * Prevents memory overflow and event loop blocking.
     */
    static async processUsersInBatches(options = {}) {
        const {
            batchSize = 1000,
            handler = async () => {},
            role = 'user',
            status = 'ACTIVE'
        } = options;

        let lastSeenId = '00000000-0000-0000-0000-000000000000'; // Initial UUID
        let hasMore = true;
        let processedCount = 0;

        console.log(`[BULK JOB] Starting batch processing for role: ${role}`);

        while (hasMore) {
            // Using ID-based pagination (Seek Method) is MUCH faster than OFFSET for 1M+ records
            const query = `
                SELECT id, phone, fcm_token, full_name
                FROM users
                WHERE role = $1 AND status = $2 AND id > $3
                ORDER BY id ASC
                LIMIT $4
            `;

            const { rows } = await pool.query(query, [role, status, lastSeenId, batchSize]);

            if (rows.length === 0) {
                hasMore = false;
                break;
            }

            // Execute the handler
            if (options.useBatchHandler) {
                // Pass the whole array of rows to the handler (Massively faster for addBulk)
                await handler(rows);
            } else {
                // Execute individual handlers concurrently
                await Promise.allSettled(rows.map(user => handler(user)));
            }

            processedCount += rows.length;
            lastSeenId = rows[rows.length - 1].id;

            console.log(`[BULK JOB] Processed ${processedCount} users...`);

            // Optional: Small delay between batches to allow Event Loop to breathe
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        console.log(`[BULK JOB] Completed. Total processed: ${processedCount}`);
        return processedCount;
    }
}

module.exports = BulkJobProcessor;
