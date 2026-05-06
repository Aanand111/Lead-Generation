const { Queue } = require('bullmq');
const { getBullConnection } = require('../config/redis');
const logger = require('../utils/logger');

const maintenanceQueue = new Queue('MaintenanceQueue', {
    connection: getBullConnection()
});

const loggedQueueErrors = new Set();

// Prevent process crash if Redis is unavailable
maintenanceQueue.on('error', (error) => {
    const key = `maintenance:${error.message}`;
    if (loggedQueueErrors.has(key)) return;

    loggedQueueErrors.add(key);
    logger.warn('[QUEUE] Maintenance queue connection error', {
        error: error.message
    });

    setTimeout(() => loggedQueueErrors.delete(key), 60000).unref();
});

const repeatableJobs = [
    {
        name: 'DailyArchiving',
        pattern: '0 1 * * *',
        jobId: 'maintenance:daily-archiving'
    },
    {
        name: 'DailyLeadCleanup',
        pattern: '0 2 * * *',
        jobId: 'maintenance:daily-lead-cleanup'
    },
    {
        name: 'DailyRenewalCheck',
        pattern: '0 9 * * *',
        jobId: 'maintenance:daily-renewal-check'
    },
    {
        name: 'AnalyticsRefresh',
        pattern: '*/5 * * * *',
        jobId: 'maintenance:analytics-refresh'
    }
];

const scheduleJobs = async () => {
    const existing = await maintenanceQueue.getRepeatableJobs();
    const expectedKeys = new Set(repeatableJobs.map((job) => `${job.name}:${job.jobId}:${job.pattern}`));

    for (const job of existing) {
        const currentKey = `${job.name}:${job.id}:${job.pattern}`;
        if (!expectedKeys.has(currentKey)) {
            await maintenanceQueue.removeRepeatableByKey(job.key);
        }
    }

    for (const job of repeatableJobs) {
        await maintenanceQueue.add(job.name, {}, {
            jobId: job.jobId,
            repeat: {
                pattern: job.pattern
            }
        });
    }
};

const closeCronQueue = async () => {
    await maintenanceQueue.close();
};

module.exports = {
    maintenanceQueue,
    scheduleJobs,
    closeCronQueue
};
