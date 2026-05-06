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
            // Construct query dynamically based on presence of role/status/excludedCity
            let query = `
                SELECT u.id, u.phone, u.fcm_token, u.full_name 
                FROM users u
                LEFT JOIN user_profiles up ON u.id = up.user_id
                WHERE 1=1 
            `;
            const queryParams = [];

            if (role) {
                queryParams.push(role);
                query += ` AND u.role = $${queryParams.length}`;
            }
            if (status) {
                queryParams.push(status);
                query += ` AND u.status = $${queryParams.length}`;
            }
            if (options.excludeCity) {
                queryParams.push(options.excludeCity);
                query += ` AND (up.city IS NULL OR up.city NOT ILIKE $${queryParams.length})`;
            }
            
            queryParams.push(lastSeenId);
            query += ` AND u.id > $${queryParams.length}`;
            
            query += ` ORDER BY u.id ASC LIMIT $${queryParams.length + 1}`;
            queryParams.push(batchSize);

            const { rows } = await pool.query(query, queryParams);

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
