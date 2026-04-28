require('dotenv').config();

const logger = require('./utils/logger');
const { validateEnv, parseNumber } = require('./config/env');
const { waitForRedisReady, isRedisConfigured, acquireLease, closeRedisConnections } = require('./config/redis');

let closeCronQueue = async () => {};
let releaseSchedulerLease = async () => {};
let shuttingDown = false;

const shutdown = async (signal, exitCode = 0) => {
    if (shuttingDown) {
        return;
    }

    shuttingDown = true;
    logger.warn('[SCHEDULER] Shutdown requested', { signal });

    await Promise.race([
        Promise.allSettled([
            closeCronQueue(),
            releaseSchedulerLease(),
            closeRedisConnections()
        ]),
        new Promise((resolve) => {
            setTimeout(resolve, parseNumber(process.env.SHUTDOWN_TIMEOUT_MS, 10000));
        })
    ]);

    process.exit(exitCode);
};

const boot = async () => {
    validateEnv();

    if (!isRedisConfigured()) {
        throw new Error('Redis is required for scheduler runtime.');
    }

    await waitForRedisReady('bullmq');

    const lockKey = process.env.SCHEDULER_LOCK_KEY || 'leadgen:scheduler:lease';
    const lease = await acquireLease(lockKey, {
        ttlMs: parseNumber(process.env.SCHEDULER_LEASE_TTL_MS, 30000),
        metadata: `scheduler:${process.pid}`
    });

    if (!lease) {
        throw new Error(`Another scheduler instance already holds lease "${lockKey}".`);
    }

    releaseSchedulerLease = lease.release;

    const { scheduleJobs, closeCronQueue: queueCloser } = require('./queues/cronQueue');
    closeCronQueue = queueCloser;

    logger.info('[SCHEDULER] Starting scheduler');
    await scheduleJobs();
    logger.info('[SCHEDULER] Repeatable jobs synchronized');
};

process.on('SIGTERM', () => {
    shutdown('SIGTERM');
});

process.on('SIGINT', () => {
    shutdown('SIGINT');
});

process.on('uncaughtException', (error) => {
    logger.error('[SCHEDULER] Uncaught exception', {
        message: error.message,
        stack: error.stack
    });
    shutdown('uncaughtException', 1);
});

process.on('unhandledRejection', (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logger.error('[SCHEDULER] Unhandled rejection', {
        message: error.message,
        stack: error.stack
    });
    shutdown('unhandledRejection', 1);
});

boot().catch((error) => {
    logger.error('[SCHEDULER] Failed to boot', {
        message: error.message,
        stack: error.stack
    });
    shutdown('startupFailure', 1);
});
