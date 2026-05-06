const jwt = require('jsonwebtoken');
const logger = require('./logger');
const { parseBoolean } = require('../config/env');
const { getAllowedOrigins } = require('../config/origins');
const { getRedisPublisher, getRedisSubscriber, isRedisConfigured, waitForRedisReady } = require('../config/redis');

const REALTIME_CHANNEL = process.env.REALTIME_CHANNEL || 'leadgen:realtime';
const instanceId = `${process.pid}:${Math.random().toString(36).slice(2, 10)}`;

let io;
let publisher;
let subscriber;
let isSubscribed = false;
let bridgeStatus = 'disabled';
let bridgePromise;

const emitLocally = (payload) => {
    if (!io || !payload) {
        return;
    }

    if (payload.scope === 'broadcast') {
        io.emit(payload.event, payload.data);
        return;
    }

    if (payload.scope === 'user' && payload.userId) {
        io.to(String(payload.userId)).emit(payload.event, payload.data);
    }
};

const ensureRedisBridge = async () => {
    if (isSubscribed || !isRedisConfigured()) {
        return;
    }

    if (bridgePromise) {
        return bridgePromise;
    }

    bridgeStatus = 'initializing';
    publisher = getRedisPublisher();
    subscriber = getRedisSubscriber();

    bridgePromise = (async () => {
        await Promise.all([
            waitForRedisReady('publisher'),
            waitForRedisReady('subscriber')
        ]);

        subscriber.on('message', (channel, rawMessage) => {
            if (channel !== REALTIME_CHANNEL) {
                return;
            }

            try {
                const payload = JSON.parse(rawMessage);
                if (payload.source === instanceId) {
                    return;
                }

                emitLocally(payload);
            } catch (error) {
                logger.warn('[SOCKET] Failed to parse pub/sub message', {
                    message: error.message
                });
            }
        });

        await subscriber.subscribe(REALTIME_CHANNEL);
        isSubscribed = true;
        bridgeStatus = 'ready';
        logger.info('[SOCKET] Redis pub/sub bridge ready', {
            channel: REALTIME_CHANNEL
        });
    })().catch((error) => {
        bridgeStatus = 'degraded';
        bridgePromise = null;
        throw error;
    });

    return bridgePromise;
};

const dispatchRealtimeEvent = (payload) => {
    if (!payload) {
        return;
    }

    const enrichedPayload = {
        ...payload,
        source: instanceId
    };

    emitLocally(enrichedPayload);

    if (publisher && publisher.status === 'ready') {
        publisher.publish(REALTIME_CHANNEL, JSON.stringify(enrichedPayload)).catch((error) => {
            logger.warn('[SOCKET] Redis publish failed after local emit', {
                message: error.message
            });
        });
    }
};

module.exports = {
    init: async (server, options = {}) => {
        if (io) {
            return io;
        }

        io = require('socket.io')(server, {
            cors: {
                origin: getAllowedOrigins(),
                methods: ['GET', 'POST']
            }
        });

        const strictRedisBridge = parseBoolean(options.requireRedisBridge, false);
        if (isRedisConfigured()) {
            try {
                await ensureRedisBridge();
            } catch (error) {
                if (strictRedisBridge) {
                    throw error;
                }

                logger.warn('[SOCKET] Redis bridge unavailable, running in single-node mode', {
                    error: error.message
                });
            }
        } else {
            bridgeStatus = 'disabled';
        }

        io.use((socket, next) => {
            const token = socket.handshake.auth?.token || socket.handshake.query?.token;
            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.userId = decoded.id;
                return next();
            } catch (error) {
                return next(new Error('Authentication error: Invalid token'));
            }
        });

        io.on('connection', (socket) => {
            const userId = socket.userId;
            if (userId) {
                socket.join(String(userId));
                logger.debug('[SOCKET] User connected', { userId });
            }

            socket.on('disconnect', () => {
                logger.debug('[SOCKET] User disconnected', { userId });
            });

            socket.on('ping', () => {
                socket.emit('pong');
            });
        });

        logger.info('[SOCKET] Realtime gateway initialized');
        return io;
    },

    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized');
        }
        return io;
    },

    sendToUser: (userId, event, data) => {
        dispatchRealtimeEvent({
            scope: 'user',
            userId: String(userId),
            event,
            data
        });
    },

    broadcast: (event, data) => {
        dispatchRealtimeEvent({
            scope: 'broadcast',
            event,
            data
        });
    },

    close: async () => {
        if (subscriber && isSubscribed) {
            try {
                await subscriber.unsubscribe(REALTIME_CHANNEL);
            } catch (error) {
                logger.warn('[SOCKET] Failed to unsubscribe realtime bridge', {
                    message: error.message
                });
            }
        }

        isSubscribed = false;
        bridgePromise = null;
        bridgeStatus = isRedisConfigured() ? 'stopped' : 'disabled';

        if (io) {
            await io.close();
            io = null;
        }

        publisher = null;
        subscriber = null;
    },

    getStatus: () => ({
        configured: isRedisConfigured(),
        bridgeStatus,
        isSubscribed,
        publisherStatus: publisher?.status || 'idle',
        subscriberStatus: subscriber?.status || 'idle'
    })
};
