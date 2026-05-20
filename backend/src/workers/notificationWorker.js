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
        // ── Handler: lead-approved-notify ─────────────────────────────────────
        // Triggered when admin approves a lead. Runs 3 targeted push operations:
        //   1. Confirmation push to whoever uploaded the lead
        //   2. Priority push to users in the same city
        //   3. General push to all other active users
        if (job.name === 'lead-approved-notify') {
            const { leadId, city, category, pincode, createdBy, uploaderName } = job.data;

            const cityLabel = city || 'your area';
            logger.info('[WORKER] Processing lead approval notifications', { leadId, city });

            // Step 1: Notify the uploader (they need confirmation)
            if (createdBy) {
                try {
                    await NotificationService.sendPushToUserId(
                        createdBy,
                        'Lead Approved! 🎉',
                        `Your lead in ${cityLabel} has been approved and is now live.`
                    );
                } catch (err) {
                    logger.warn('[WORKER] Uploader confirmation push failed (non-fatal)', {
                        leadId,
                        createdBy,
                        message: err.message
                    });
                }
            }

            // Step 2: Priority push to users IN the same city
            try {
                await NotificationService.sendPushToCity(
                    city,
                    `Urgent: New Lead in ${cityLabel}! 🔥`,
                    `A fresh ${category || 'General'} lead was just uploaded in ${cityLabel}` +
                        `${pincode ? ` (Pincode: ${pincode})` : ''}. Grab it now!`,
                    { type: 'NEW_LEAD', leadId, city, category, isSpecial: true }
                );
            } catch (err) {
                logger.warn('[WORKER] City push failed (non-fatal)', {
                    leadId,
                    city,
                    message: err.message
                });
            }

            // Step 3: General push to ALL OTHER users (excluding the city)
            try {
                await NotificationService.sendPushToAllExceptCity(
                    city,
                    'New Lead Alert! 🚀',
                    `${uploaderName} uploaded a new ${category || 'General'} lead in ${cityLabel}. Check it out!`,
                    { type: 'NEW_LEAD', leadId, city, category, isSpecial: false }
                );
            } catch (err) {
                logger.warn('[WORKER] All-except-city push failed (non-fatal)', {
                    leadId,
                    message: err.message
                });
            }

            logger.info('[WORKER] Lead approval notifications dispatched', { leadId });
            return;
        }

        // ── Handler: individual user broadcast ────────────────────────────────
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
