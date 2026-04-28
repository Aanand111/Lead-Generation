const { redisConnection, isRedisReady } = require('../config/redis');
const logger = require('../utils/logger');

const buildCacheKey = (req) => {
    const userScope = req.user?.id ? `user:${req.user.id}:` : '';
    const queryEntries = Object.entries(req.query || {}).sort(([left], [right]) => left.localeCompare(right));
    const queryString = new URLSearchParams(queryEntries).toString();
    const suffix = queryString ? `?${queryString}` : '';

    return `cache:${userScope}${req.baseUrl || ''}${req.path}${suffix}`;
};

const cacheMiddleware = (ttl = 300) => {
    return async (req, res, next) => {
        if (req.method !== 'GET' || !isRedisReady()) {
            return next();
        }

        const key = buildCacheKey(req);

        try {
            const cachedData = await redisConnection.get(key);
            if (cachedData) {
                logger.debug('[CACHE] Hit', { key });
                return res.status(200).json(JSON.parse(cachedData));
            }

            logger.debug('[CACHE] Miss', { key });

            const originalJson = res.json.bind(res);
            res.json = (payload) => {
                if (res.statusCode === 200) {
                    redisConnection
                        .set(key, JSON.stringify(payload), 'EX', ttl)
                        .catch((error) => {
                            logger.warn('[CACHE] Failed to persist value', {
                                key,
                                message: error.message
                            });
                        });
                }

                return originalJson(payload);
            };

            return next();
        } catch (error) {
            logger.warn('[CACHE] Redis unavailable, bypassing cache', {
                key,
                message: error.message
            });
            return next();
        }
    };
};

module.exports = cacheMiddleware;
