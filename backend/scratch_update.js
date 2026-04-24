const db = require('./src/config/db');

async function updateTransactionStatuses() {
    try {
        console.log('Starting transaction status update...');
        const result = await db.query(
            "UPDATE transactions SET status = 'COMPLETED' WHERE status = 'SUCCESS' RETURNING id"
        );
        console.log(`Successfully updated ${result.rowCount} transactions from SUCCESS to COMPLETED.`);
    } catch (error) {
        console.error('Error updating transaction statuses:', error);
    } finally {
        process.exit();
    }
}

updateTransactionStatuses();
