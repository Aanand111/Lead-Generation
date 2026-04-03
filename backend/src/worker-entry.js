require('dotenv').config();

// Load the worker configuration and start processing the queue
require('./workers/notificationWorker');

console.log('--- Background Job Worker is alive ---');

// Keep process running
process.on('SIGTERM', () => {
    console.log('SIGTERM received, worker shutting down gracefully');
});
