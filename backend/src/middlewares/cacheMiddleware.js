const { redisConnection, isRedisReady } = require('../config/redis');
const { parseNumber } = require('../config/env');
const logger = require('../utils/logger');

const localCache = new Map();
const inFlightRequests = new Map();
const LOCAL_CACHE_MAX_ENTRIES = parseNumber(process.env.LOCAL_CACHE_MAX_ENTRIES, 5000);

const buildCacheKey = (req) => {
    const userScope = req.user?.id ? `user:${req.user.id}:` : '';
    const queryEntries = Object.entries(req.query || {}).sort(([left], [right]) => left.localeCompare(right));
    const queryString = new URLSearchParams(queryEntries).toString();
    const suffix = queryString ? `?${queryString}` : '';

    return `cache:${userScope}${req.baseUrl || ''}${req.path}${suffix}`;
};

const getLocalEntry = (key) => {
    const entry = localCache.get(key);
    if (!entry) {
        return null;
    }

    if (entry.expiresAt <= Date.now()) {
        localCache.delete(key);
        return null;
    }

    return entry.payload;
};

const setLocalEntry = (key, payload, ttlSeconds) => {
    if (localCache.size >= LOCAL_CACHE_MAX_ENTRIES) {
        const oldestKey = localCache.keys().next().value;
        if (oldestKey) {
            localCache.delete(oldestKey);
        }
    }

    localCache.set(key, {
        payload,
        expiresAt: Date.now() + (ttlSeconds * 1000)
    });
};

const deleteLocalByPrefix = (prefix) => {
    for (const key of localCache.keys()) {
        if (key.startsWith(prefix)) {
            localCache.delete(key);
        }
    }
};

const deleteRedisByPrefix = async (prefix) => {
    if (!isRedisReady()) {
        return;
    }

    let cursor = '0';
    const pattern = `${prefix}*`;

    do {
        const [nextCursor, keys] = await redisConnection.scan(cursor, 'MATCH', pattern, 'COUNT', 200);
        cursor = nextCursor;

        if (keys.length > 0) {
            await redisConnection.del(...keys);
        }
    } while (cursor !== '0');
};

const invalidateCachePrefix = async (prefix) => {
    deleteLocalByPrefix(prefix);

    try {
        await deleteRedisByPrefix(prefix);
    } catch (error) {
        logger.warn('[CACHE] Failed to invalidate prefix', {
            prefix,
            message: error.message
        });
    }
};

const invalidateUserCachePaths = async (userId, paths) => {
    await Promise.all(
        paths.map((path) => invalidateCachePrefix(`cache:user:${userId}:${path}`))
    );
};

const cacheMiddleware = (ttl = 300) => {
    return async (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        const key = buildCacheKey(req);
        const localPayload = getLocalEntry(key);
        if (localPayload) {
            logger.debug('[CACHE] Local hit', { key });
            return res
                .status(200)
                .type('application/json')
                .send(localPayload);
        }

        const pendingRequest = inFlightRequests.get(key);
        if (pendingRequest) {
            try {
                const payload = await pendingRequest;
                logger.debug('[CACHE] In-flight hit', { key });
                return res
                    .status(200)
                    .type('application/json')
                    .send(payload);
            } catch (error) {
                logger.warn('[CACHE] In-flight wait failed, bypassing cache', {
                    key,
                    message: error.message
                });
            }
        }

        let resolveInFlight;
        let rejectInFlight;
        let settled = false;
        const inFlightPromise = new Promise((resolve, reject) => {
            resolveInFlight = resolve;
            rejectInFlight = reject;
        });
        inFlightRequests.set(key, inFlightPromise);

        const settleInFlight = (error, payload) => {
            if (settled) {
                return;
            }

            settled = true;
            inFlightRequests.delete(key);

            if (error) {
                rejectInFlight(error);
                return;
            }

            resolveInFlight(payload);
        };

        if (!isRedisReady()) {
            const originalSend = res.send.bind(res);
            const originalJson = res.json.bind(res);
            res.json = (payload) => {
                if (res.statusCode === 200) {
                    const serializedPayload = JSON.stringify(payload);
                    setLocalEntry(key, serializedPayload, ttl);
                    settleInFlight(null, serializedPayload);
                    res.type('application/json');
                    return originalSend(serializedPayload);
                } else {
                    settleInFlight(new Error(`HTTP ${res.statusCode}`));
                }

                res.json = originalJson;
                return originalJson(payload);
            };

            res.on('finish', () => {
                if (res.statusCode !== 200) {
                    settleInFlight(new Error(`HTTP ${res.statusCode}`));
                }
            });

            res.on('close', () => {
                if (!settled) {
                    settleInFlight(new Error('Connection closed before response was cached.'));
                }
            });

            return next();
        }

        try {
            const cachedData = await redisConnection.get(key);
            if (cachedData) {
                setLocalEntry(key, cachedData, ttl);
                logger.debug('[CACHE] Hit', { key });
                settleInFlight(null, cachedData);
                return res
                    .status(200)
                    .type('application/json')
                    .send(cachedData);
            }

            logger.debug('[CACHE] Miss', { key });

            const originalSend = res.send.bind(res);
            const originalJson = res.json.bind(res);
            res.json = (payload) => {
                if (res.statusCode === 200) {
                    const serializedPayload = JSON.stringify(payload);
                    setLocalEntry(key, serializedPayload, ttl);
                    redisConnection
                        .set(key, serializedPayload, 'EX', ttl)
                        .catch((error) => {
                            logger.warn('[CACHE] Failed to persist value', {
                                key,
                                message: error.message
                            });
                        });

                    settleInFlight(null, serializedPayload);
                    res.type('application/json');
                    return originalSend(serializedPayload);
                } else {
                    settleInFlight(new Error(`HTTP ${res.statusCode}`));
                }

                res.json = originalJson;
                return originalJson(payload);
            };

            res.on('finish', () => {
                if (res.statusCode !== 200) {
                    settleInFlight(new Error(`HTTP ${res.statusCode}`));
                }
            });

            res.on('close', () => {
                if (!settled) {
                    settleInFlight(new Error('Connection closed before response was cached.'));
                }
            });

            return next();
        } catch (error) {
            logger.warn('[CACHE] Redis unavailable, bypassing cache', {
                key,
                message: error.message
            });

            settleInFlight(new Error(`Redis cache unavailable: ${error.message}`));
            return next();
        }
    };
};

cacheMiddleware.buildCacheKey = buildCacheKey;
cacheMiddleware.invalidateCachePrefix = invalidateCachePrefix;
cacheMiddleware.invalidateUserCachePaths = invalidateUserCachePaths;

module.exports = cacheMiddleware;
