const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const hpp = require('hpp');
const { RedisStore } = require('rate-limit-redis');

require('dotenv').config();

const { validateEnv, parseBoolean, parseNumber, isProduction } = require('./config/env');
const { isOriginAllowed } = require('./config/origins');
const logger = require('./utils/logger');
const swaggerSetup = require('./config/swagger');
const correlationMiddleware = require('./middlewares/correlationMiddleware');
const { errorHandler } = require('./middlewares/errorMiddleware');
const { runMigrations } = require('./database/migrate');
const {
    redisConnection,
    isRedisConfigured,
    getRedisStatus,
    waitForRedisReady,
    closeRedisConnections
} = require('./config/redis');
const {
    getPoolStatus,
    checkDatabaseHealth,
    closePool
} = require('./config/db');
const socketGateway = require('./utils/socket');

validateEnv();

const app = express();
let server;
let shuttingDown = false;
let isOverloaded = false;

app.set('trust proxy', parseBoolean(process.env.TRUST_PROXY, true) ? 1 : false);
app.disable('x-powered-by');

app.use(correlationMiddleware);

morgan.token('correlation-id', (req) => req.correlationId || '-');
app.use(morgan(':correlation-id :method :url :status :res[content-length] - :response-time ms', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

app.use(cors({
    origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'Idempotency-Key']
}));

app.use(helmet({
    crossOriginResourcePolicy: {
        policy: 'cross-origin'
    }
}));
app.use(compression());

const eventLoopLagThresholdMs = parseNumber(process.env.EVENT_LOOP_LAG_THRESHOLD_MS, 70);
setInterval(() => {
    const startedAt = Date.now();
    setImmediate(() => {
        isOverloaded = Date.now() - startedAt > eventLoopLagThresholdMs;
    });
}, 500).unref();

app.use((req, res, next) => {
    if (isOverloaded && !req.path.startsWith('/api/health')) {
        res.set('Connection', 'close');
        return res.status(503).json({
            success: false,
            message: 'Server overloaded. Please retry shortly.'
        });
    }

    return next();
});

const bodyLimitKb = parseNumber(process.env.MAX_JSON_BODY_KB, 32);
app.use(express.json({ limit: `${bodyLimitKb}kb` }));
app.use(express.urlencoded({ extended: true, limit: `${bodyLimitKb}kb` }));
app.use(hpp());

const createRateLimitStore = (prefix) => {
    if (!isRedisConfigured()) {
        logger.warn('[RATE LIMIT] Redis not configured, using in-memory store', { prefix });
        return undefined;
    }

    return new RedisStore({
        sendCommand: (...args) => redisConnection.call(...args),
        prefix
    });
};

const generalStore = createRateLimitStore('rl:general:');
const authStore = createRateLimitStore('rl:auth:');
const contactStore = createRateLimitStore('rl:contact:');

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseNumber(process.env.GENERAL_RATE_LIMIT_MAX, 5000),
    standardHeaders: true,
    legacyHeaders: false,
    passOnStoreError: true,
    ...(generalStore ? { store: generalStore } : {}),
    message: { success: false, message: 'Too many requests. Please try again later.' },
    skip: (req) => req.path.startsWith('/api/health')
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseNumber(process.env.AUTH_RATE_LIMIT_MAX, 15),
    standardHeaders: true,
    legacyHeaders: false,
    passOnStoreError: true,
    ...(authStore ? { store: authStore } : {}),
    message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' }
});

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: parseNumber(process.env.CONTACT_RATE_LIMIT_MAX, 10),
    standardHeaders: true,
    legacyHeaders: false,
    passOnStoreError: true,
    ...(contactStore ? { store: contactStore } : {}),
    message: { success: false, message: 'Contact limit exceeded. Please try again after an hour.' }
});

swaggerSetup(app);

app.get('/', (req, res) => {
    res.send('Lead Generation API is running.');
});

const buildHealthPayload = async () => {
    const db = await checkDatabaseHealth();
    const redis = getRedisStatus();
    const socket = socketGateway.getStatus();
    const redisRequired = parseBoolean(process.env.REQUIRE_REDIS_FOR_READINESS, isProduction());
    const redisUp = redis.status === 'ready';
    const socketHealthy = !socket.configured || socket.bridgeStatus === 'ready';
    const healthy = db.status === 'UP' && (!redisRequired || (redisUp && socketHealthy));

    return {
        httpStatus: healthy ? 200 : 503,
        body: {
            success: healthy,
            status: healthy ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            services: {
                server: 'UP',
                database: db.connectionStatus || db.status,
                schema: db.schemaStatus || 'UNKNOWN',
                redis: redisUp ? 'UP' : (redis.configured ? 'DOWN' : 'DISABLED'),
                realtime: socket.bridgeStatus === 'ready'
                    ? 'UP'
                    : (socket.configured ? socket.bridgeStatus.toUpperCase() : 'DISABLED')
            },
            latencyMs: {
                database: db.latencyMs
            },
            schema: db.schema || null,
            pool: getPoolStatus(),
            runtime: {
                role: process.env.RUNTIME_ROLE || 'api',
                pid: process.pid
            }
        }
    };
};

app.get('/api/health/live', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'live',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health/ready', async (req, res) => {
    const payload = await buildHealthPayload();
    res.status(payload.httpStatus).json(payload.body);
});

app.get('/api/health', async (req, res) => {
    const payload = await buildHealthPayload();
    res.status(payload.httpStatus).json(payload.body);
});

app.use('/api/', generalLimiter);
app.use('/api/auth', authLimiter, require('./modules/auth/auth.routes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/vendor', require('./routes/vendorRoutes'));
app.use('/api/sub-vendor', require('./routes/subVendorRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/notifications', require('./modules/notifications/notifications.routes'));
app.use('/api/webhooks', require('./routes/webhookRoutes'));

const { submitMessage } = require('./controllers/contactController');
app.post('/api/contact', contactLimiter, submitMessage);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(errorHandler);

const shutdown = async (signal, exitCode = 0) => {
    if (shuttingDown) {
        return;
    }

    shuttingDown = true;
    logger.warn('[SERVER] Shutdown requested', { signal });

    if (server) {
        await new Promise((resolve) => {
            server.close(resolve);
        });
    }

    await Promise.allSettled([
        socketGateway.close(),
        closeRedisConnections(),
        closePool()
    ]);

    process.exit(exitCode);
};

const startServer = async () => {
    logger.debug('[SERVER] Starting server initialization...');
    
    // Auto-run migrations on startup
    await runMigrations();
    
    const dbHealth = await checkDatabaseHealth();
    if (dbHealth.status !== 'UP') {
        throw new Error(`Database unavailable during startup: ${dbHealth.error || `schema ${dbHealth.schemaStatus || 'unknown'}`}`);
    }
    logger.debug('[SERVER] Database health verified');

    const requireRedisForStartup = parseBoolean(
        process.env.REQUIRE_REDIS_FOR_STARTUP,
        isProduction() && isRedisConfigured()
    );

    if (isRedisConfigured()) {
        logger.debug('[SERVER] Waiting for Redis (optional)...');
        try {
            await waitForRedisReady('default');
            logger.debug('[SERVER] Redis is ready');
        } catch (error) {
            if (requireRedisForStartup) {
                logger.error('[SERVER] Redis required but failed to connect', { error: error.message });
                throw error;
            }

            logger.warn('[SERVER] Redis not ready during startup, continuing in degraded mode', {
                error: error.message
            });
        }
    } else if (requireRedisForStartup) {
        throw new Error('Redis is required for API startup but no Redis configuration was provided.');
    }

    logger.debug('[SERVER] Initializing Socket.io gateway...');
    server = http.createServer(app);
    await socketGateway.init(server, {
        requireRedisBridge: requireRedisForStartup && isRedisConfigured()
    });
    logger.debug('[SERVER] Socket.io gateway initialized');

    server.keepAliveTimeout = parseNumber(process.env.KEEP_ALIVE_TIMEOUT_MS, 65000);
    server.headersTimeout = parseNumber(process.env.HEADERS_TIMEOUT_MS, 66000);
    server.requestTimeout = parseNumber(process.env.REQUEST_TIMEOUT_MS, 30000);

    const port = parseNumber(process.env.PORT, 5000);
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            logger.error(`[SERVER] Port ${port} is already in use. Please kill the process using this port or use a different one.`);
            process.exit(1);
        } else {
            logger.error('[SERVER] Unexpected error during startup', { error: error.message });
            process.exit(1);
        }
    });

    server.listen(port, () => {
        logger.info('[SERVER] API is live', {
            port,
            mode: process.env.NODE_ENV || 'development'
        });
    });
};

process.on('SIGTERM', () => {
    shutdown('SIGTERM');
});

process.on('SIGINT', () => {
    shutdown('SIGINT');
});

process.on('uncaughtException', (error) => {
    logger.error('[SERVER] Uncaught exception', {
        message: error.message,
        stack: error.stack
    });
    shutdown('uncaughtException', 1);
});

process.on('unhandledRejection', (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logger.error('[SERVER] Unhandled rejection', {
        message: error.message,
        stack: error.stack
    });
    shutdown('unhandledRejection', 1);
});

startServer().catch((error) => {
    logger.error('[SERVER] Failed to start', {
        message: error.message,
        stack: error.stack
    });
    shutdown('startupFailure', 1);
});

module.exports = app;
