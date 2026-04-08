// const { Worker } = require('bullmq');
// const { redisOptions } = require('../config/redis');
// const { pool } = require('../config/db');
// const NotificationService = require('../services/notificationService');

// console.log('[WORKER] Notification worker process started...');

// /**
//  * notificationWorker: Distributes workload across CPU cores.
//  * Concurrency: 50 (Processes 50 notifications simultaneously per worker process).
//  * If 8 CPU cores run PM2, 8 x 50 = 400 parallel notifications!
//  */
// const worker = new Worker('notification-broadcast', async job => {
//   const { userId, userPhone, title, body, campaignId } = job.data;
  
//   try {
//     // 1. Send actual message (FCM/SMS/Email)
//     const result = await NotificationService.sendPushToUser(userPhone, title, body);

//     // 2. Log success to DB for tracking (optimized update)
//     if (result.success) {
//       await pool.query(
//         'UPDATE broadcast_campaigns SET success_count = success_count + 1, processed_users = processed_users + 1 WHERE id = $1',
//         [campaignId]
//       );
//     } else {
//       await pool.query(
//         'UPDATE broadcast_campaigns SET failure_count = failure_count + 1, processed_users = processed_users + 1 WHERE id = $1',
//         [campaignId]
//       );
//     }
//   } catch (error) {
//     console.error(`[WORKER ERROR] Job ${job.id}:`, error.message);
//     throw error; // Let BullMQ retry
//   }
// }, {
//   connection: redisOptions,
//   concurrency: 50,  // Scale up concurrency for higher throughput
//   limiter: {
//     max: 1000,      // Max jobs per 1 second to stay within FCM/Provider limits
//     duration: 1000,
//   }
// });

// worker.on('failed', (job, err) => {
//   console.error(`[WORKER FAILED] Job ID ${job.id}: ${err.message}`);
// });

// worker.on('completed', (job) => {
//   // Silence on production
//   // console.log(`[WORKER DONE] Job ID ${job.id}`);
// });

// module.exports = worker;




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
