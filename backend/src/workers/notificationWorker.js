const { Queue, Worker } = require('bullmq');
const { pool } = require('../config/db');
const Redis = require('ioredis');
const NotificationService = require('../services/notificationService');
const { archiveExpiredPosters, expirePurchasedLeads, checkPackageRenewals } = require('../jobs/maintenanceJobs');

// Correct Redis connection for BullMQ
const connection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null }) // Railway
  : new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
    });

console.log('[WORKER] Multi-role Worker Process Initiated...');

/**
 * 1. Broadcast Worker (High-Velocity High-Scale Messaging)
 * Implementation: Memory Batching to avoid DB Row Locking
 */
const statsBuffer = new Map(); // Store counts temporarily: { campaignId: { success: 0, fail: 0, total: 0 } }

const syncStatsToDB = async () => {
  for (const [campaignId, stats] of statsBuffer.entries()) {
    if (stats.total > 0) {
      try {
        await pool.query(
          `UPDATE broadcast_campaigns 
           SET success_count = success_count + $1, 
               failure_count = failure_count + $2, 
               processed_users = processed_users + $3 
           WHERE id = $4`,
          [stats.success, stats.fail, stats.total, campaignId]
        );
        // Clear counts after sync
        stats.success = 0; stats.fail = 0; stats.total = 0;
      } catch (err) {
        console.error('[SYNC ERROR] Failed to sync campaign stats:', err.message);
      }
    }
  }
};

// Sync with DB every 2 seconds
setInterval(syncStatsToDB, 2000);

const broadcastWorker = new Worker('notification-broadcast', async job => {
  const { userId, title, body, campaignId } = job.data;
  
  try {
    const result = await NotificationService.sendPushToUserId(userId, title, body);

    // Initialize buffer for this campaign if not exists
    if (!statsBuffer.has(campaignId)) {
        statsBuffer.set(campaignId, { success: 0, fail: 0, total: 0 });
    }
    
    const stats = statsBuffer.get(campaignId);
    if (result.success) {
      stats.success++;
    } else {
      stats.fail++;
    }
    stats.total++;

  } catch (error) {
    console.error(`[BROADCAST ERROR] Job ${job.id}:`, error.message);
    throw error; 
  }
}, {
  connection,
  concurrency: 200,  // Process 200 messages in parallel
  limiter: {
    max: 2000,       // Higher throughput
    duration: 1000,
  }
});

/**
 * 2. Maintenance Worker (Cron Jobs)
 * Queue: 'MaintenanceQueue'
 */
const maintenanceWorker = new Worker('MaintenanceQueue', async (job) => {
    console.log(`[WORKER] Running maintenance task: ${job.name}`);
    
    if (job.name === 'DailyArchiving') {
        await archiveExpiredPosters();
    } else if (job.name === 'DailyLeadCleanup') {
        await expirePurchasedLeads();
    } else if (job.name === 'DailyRenewalCheck') {
        await checkPackageRenewals();
    }
}, { connection });


// Error Logging
broadcastWorker.on('failed', (job, err) => console.error(`[BROADCAST FAILED] Job ${job.id}: ${err.message}`));
maintenanceWorker.on('failed', (job, err) => console.error(`[MAINTENANCE FAILED] Job ${job.id}: ${err.message}`));

module.exports = {
    broadcastWorker,
    maintenanceWorker
};
