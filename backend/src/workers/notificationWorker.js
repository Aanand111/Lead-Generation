const { Worker } = require('bullmq');
const { pool } = require('../config/db');
const logger = require('../utils/logger');
const NotificationService = require('../services/notificationService');
const {
    archiveExpiredPosters,
    expirePurchasedLeads,
    checkPackageRenewals,
    refreshAnalyticsView
} = require('../jobs/maintenanceJobs');
const { getBullConnection } = require('../config/redis');

const connection = getBullConnection();
const statsBuffer = new Map();

const syncStatsToDB = async () => {
    for (const [campaignId, stats] of statsBuffer.entries()) {
        if (stats.total === 0) {
            continue;
        }

        try {
            await pool.query(
                `UPDATE broadcast_campaigns 
                 SET success_count = success_count + $1, 
                     failure_count = failure_count + $2, 
                     processed_users = processed_users + $3 
                 WHERE id = $4`,
                [stats.success, stats.fail, stats.total, campaignId]
            );

            stats.success = 0;
            stats.fail = 0;
            stats.total = 0;
        } catch (error) {
            logger.error('[WORKER] Failed to sync campaign stats', {
                campaignId,
                message: error.message
            });
        }
    }
};

const statsFlushInterval = setInterval(syncStatsToDB, 2000);
statsFlushInterval.unref();

const broadcastWorker = new Worker(
    'notification-broadcast',
    async (job) => {
        const { userId, title, body, campaignId } = job.data;

        try {
            const result = await NotificationService.sendPushToUserId(userId, title, body);
            if (!statsBuffer.has(campaignId)) {
                statsBuffer.set(campaignId, { success: 0, fail: 0, total: 0 });
            }

            const stats = statsBuffer.get(campaignId);
            if (result && result.success === false) {
                stats.fail += 1;
            } else {
                stats.success += 1;
            }
            stats.total += 1;
        } catch (error) {
            logger.error('[WORKER] Broadcast job failed', {
                jobId: job.id,
                message: error.message
            });
            throw error;
        }
    },
    {
        connection,
        concurrency: Number.parseInt(process.env.NOTIFICATION_WORKER_CONCURRENCY || '200', 10),
        limiter: {
            max: Number.parseInt(process.env.NOTIFICATION_WORKER_RATE || '2000', 10),
            duration: 1000
        }
    }
);

const maintenanceWorker = new Worker(
    'MaintenanceQueue',
    async (job) => {
        logger.info('[WORKER] Running maintenance task', {
            name: job.name
        });

        if (job.name === 'DailyArchiving') {
            await archiveExpiredPosters();
            return;
        }

        if (job.name === 'DailyLeadCleanup') {
            await expirePurchasedLeads();
            return;
        }

        if (job.name === 'DailyRenewalCheck') {
            await checkPackageRenewals();
            return;
        }

        if (job.name === 'AnalyticsRefresh') {
            await refreshAnalyticsView();
        }
    },
    {
        connection
    }
);

broadcastWorker.on('failed', (job, error) => {
    logger.error('[WORKER] Broadcast job failed permanently', {
        jobId: job?.id,
        message: error.message
    });
});

maintenanceWorker.on('failed', (job, error) => {
    logger.error('[WORKER] Maintenance job failed', {
        jobId: job?.id,
        name: job?.name,
        message: error.message
    });
});

const closeWorkers = async () => {
    clearInterval(statsFlushInterval);
    await syncStatsToDB();
    await Promise.allSettled([
        broadcastWorker.close(),
        maintenanceWorker.close()
    ]);
};

module.exports = {
    broadcastWorker,
    maintenanceWorker,
    closeWorkers
};
