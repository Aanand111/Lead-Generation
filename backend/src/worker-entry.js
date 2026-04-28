require('dotenv').config();

const logger = require('./utils/logger');
const { validateEnv, parseNumber } = require('./config/env');
const { waitForRedisReady, isRedisConfigured, closeRedisConnections } = require('./config/redis');
const { checkDatabaseHealth, closePool } = require('./config/db');

let closeWorkers = async () => {};
let shuttingDown = false;

const shutdown = async (signal, exitCode = 0) => {
    if (shuttingDown) {
        return;
    }

    shuttingDown = true;
    logger.warn('[WORKER] Shutdown requested', { signal });

    await Promise.race([
        Promise.allSettled([
            closeWorkers(),
            closeRedisConnections(),
            closePool()
        ]),
        new Promise((resolve) => {
            setTimeout(resolve, parseNumber(process.env.SHUTDOWN_TIMEOUT_MS, 10000));
        })
    ]);

    process.exit(exitCode);
};

const boot = async () => {
    validateEnv();

    const dbHealth = await checkDatabaseHealth();
    if (dbHealth.status !== 'UP') {
        throw new Error(`Database unavailable during worker startup: ${dbHealth.error || 'unknown error'}`);
    }

    if (!isRedisConfigured()) {
        throw new Error('Redis is required for worker runtime.');
    }

    await waitForRedisReady('bullmq');

    ({ closeWorkers } = require('./workers/notificationWorker'));
    logger.info('[WORKER] Background worker process is running');
};

process.on('SIGTERM', () => {
    shutdown('SIGTERM');
});

process.on('SIGINT', () => {
    shutdown('SIGINT');
});

process.on('uncaughtException', (error) => {
    logger.error('[WORKER] Uncaught exception', {
        message: error.message,
        stack: error.stack
    });
    shutdown('uncaughtException', 1);
});

process.on('unhandledRejection', (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logger.error('[WORKER] Unhandled rejection', {
        message: error.message,
        stack: error.stack
    });
    shutdown('unhandledRejection', 1);
});

boot().catch((error) => {
    logger.error('[WORKER] Failed to boot', {
        message: error.message,
        stack: error.stack
    });
    shutdown('startupFailure', 1);
});
