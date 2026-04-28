const Redis = require('ioredis');
const logger = require('../utils/logger');
const { parseBoolean, parseNumber } = require('./env');

const clients = new Map();
const loggedErrors = new Set();
const activeLeases = new Map();

const buildRedisOptions = (role) => {
    const options = {
        maxRetriesPerRequest: null,
        enableReadyCheck: true,
        lazyConnect: false,
        retryStrategy: (attempt) => Math.min(attempt * 100, 2000),
        connectionName: `leadgen:${role}:${process.pid}`
    };

    if (parseBoolean(process.env.REDIS_TLS, false)) {
        options.tls = {
            rejectUnauthorized: parseBoolean(process.env.REDIS_TLS_REJECT_UNAUTHORIZED, false)
        };
    }

    return options;
};

const createRedisClient = (role = 'default') => {
    const options = buildRedisOptions(role);

    const client = process.env.REDIS_URL
        ? new Redis(process.env.REDIS_URL, options)
        : new Redis({
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: parseNumber(process.env.REDIS_PORT, 6379),
            password: process.env.REDIS_PASSWORD || undefined,
            ...options
        });

    client.on('connect', () => {
        logger.info('[REDIS] Connected', { role });
    });

    client.on('ready', () => {
        logger.info('[REDIS] Ready', { role });
    });

    client.on('error', (error) => {
        const key = `${role}:${error.message}`;
        if (loggedErrors.has(key)) {
            return;
        }

        loggedErrors.add(key);
        logger.warn('[REDIS] Client error', {
            role,
            message: error.message
        });
    });

    client.on('end', () => {
        logger.warn('[REDIS] Connection closed', { role });
    });

    return client;
};

const getRedisClient = (role = 'default') => {
    if (!clients.has(role)) {
        clients.set(role, createRedisClient(role));
    }

    return clients.get(role);
};

const redisConnection = getRedisClient('default');

const getRedisPublisher = () => getRedisClient('publisher');
const getRedisSubscriber = () => getRedisClient('subscriber');
const getBullConnection = () => getRedisClient('bullmq');

const isRedisReady = () => redisConnection.status === 'ready';
const isRedisConfigured = () => Boolean(process.env.REDIS_URL || process.env.REDIS_HOST);

const waitForRedisReady = async (role = 'default', timeoutMs = parseNumber(process.env.REDIS_READY_TIMEOUT_MS, 10000)) => {
    if (!isRedisConfigured()) {
        return false;
    }

    const client = getRedisClient(role);
    if (client.status === 'ready') {
        return true;
    }

    await Promise.race([
        new Promise((resolve, reject) => {
            const cleanup = () => {
                client.off('ready', onReady);
                client.off('error', onError);
            };

            const onReady = () => {
                cleanup();
                resolve(true);
            };

            const onError = (error) => {
                cleanup();
                reject(error);
            };

            client.once('ready', onReady);
            client.once('error', onError);
        }),
        new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Timed out waiting for Redis role "${role}" to become ready`)), timeoutMs);
        })
    ]);

    return true;
};

const getRedisStatus = () => ({
    configured: isRedisConfigured(),
    status: redisConnection.status,
    activeLeases: Array.from(activeLeases.keys())
});

const acquireLease = async (key, {
    ttlMs = parseNumber(process.env.REDIS_LEASE_TTL_MS, 30000),
    renewEveryMs = Math.max(1000, Math.floor(ttlMs / 3)),
    metadata = `${process.pid}`
} = {}) => {
    const client = getRedisClient('default');
    const token = `${process.pid}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
    const lockValue = JSON.stringify({ token, metadata });

    const acquired = await client.set(key, lockValue, 'PX', ttlMs, 'NX');
    if (acquired !== 'OK') {
        return null;
    }

    const renewScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("pexpire", KEYS[1], ARGV[2])
        end
        return 0
    `;

    const releaseScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        end
        return 0
    `;

    let released = false;
    const renewTimer = setInterval(async () => {
        try {
            const renewed = await client.eval(renewScript, 1, key, lockValue, ttlMs);
            if (renewed !== 1) {
                logger.error('[REDIS] Lease renewal lost ownership', { key, metadata });
                clearInterval(renewTimer);
                activeLeases.delete(key);
            }
        } catch (error) {
            logger.error('[REDIS] Lease renewal failed', {
                key,
                metadata,
                message: error.message
            });
        }
    }, renewEveryMs);
    renewTimer.unref();

    const release = async () => {
        if (released) {
            return;
        }

        released = true;
        clearInterval(renewTimer);
        activeLeases.delete(key);

        try {
            await client.eval(releaseScript, 1, key, lockValue);
        } catch (error) {
            logger.warn('[REDIS] Lease release failed', {
                key,
                metadata,
                message: error.message
            });
        }
    };

    activeLeases.set(key, { release });
    logger.info('[REDIS] Lease acquired', { key, metadata, ttlMs });

    return {
        key,
        token,
        metadata,
        release
    };
};

const closeRedisConnections = async () => {
    await Promise.allSettled(
        Array.from(activeLeases.values()).map((lease) => lease.release())
    );

    await Promise.allSettled(
        Array.from(clients.values()).map(async (client) => {
            try {
                await client.quit();
            } catch (error) {
                client.disconnect();
            }
        })
    );
    clients.clear();
    loggedErrors.clear();
};

module.exports = {
    redisConnection,
    getRedisClient,
    getRedisPublisher,
    getRedisSubscriber,
    getBullConnection,
    isRedisReady,
    isRedisConfigured,
    waitForRedisReady,
    getRedisStatus,
    acquireLease,
    closeRedisConnections
};
