const { Queue, Worker } = require('bullmq');
const { redisOptions } = require('../config/redis');
const { archiveExpiredPosters, expirePurchasedLeads } = require('../jobs/maintenanceJobs');

// 1. Create Maintenance Queue
const maintenanceQueue = new Queue('MaintenanceQueue', {
    connection: redisOptions
});

// 2. Define Worker Logic
const worker = new Worker('MaintenanceQueue', async (job) => {
    console.log(`[WORKER] Running maintenance job: ${job.name}`);
    
    if (job.name === 'DailyArchiving') {
        await archiveExpiredPosters();
    } else if (job.name === 'DailyLeadCleanup') {
        await expirePurchasedLeads();
    }
}, { connection: redisOptions });

// 3. Schedule Repeatable Jobs (Repeat Daily)
const scheduleJobs = async () => {
    // Clear existing jobs to avoid duplicates (optional but safe)
    await maintenanceQueue.drain();
    
    // Day cron at 01:00 AM
    await maintenanceQueue.add('DailyArchiving', {}, {
        repeat: { pattern: '0 1 * * *' }
    });
    
    // Day cron at 02:00 AM
    await maintenanceQueue.add('DailyLeadCleanup', {}, {
        repeat: { pattern: '0 2 * * *' }
    });

    console.log('[CRON] Maintenance jobs successfully scheduled in Redis.');
};

// Error handling for worker
worker.on('failed', (job, err) => {
    console.error(`[WORKER ERROR] Job ${job.id} failed: ${err.message}`);
});

module.exports = {
    maintenanceQueue,
    scheduleJobs
};
