const { Pool } = require('pg');
const logger = require('../utils/logger');
const { parseBoolean, parseNumber, getRuntimeRole } = require('./env');

const buildSslConfig = () => {
    if (!parseBoolean(process.env.DB_SSL, false)) {
        return undefined;
    }

    return {
        rejectUnauthorized: parseBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED, false)
    };
};

const buildBasePoolConfig = () => {
    const ssl = buildSslConfig();

    if (process.env.DATABASE_URL) {
        return {
            connectionString: process.env.DATABASE_URL,
            ...(ssl ? { ssl } : {})
        };
    }

    return {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'leadgen',
        password: process.env.DB_PASSWORD || 'postgres',
        port: parseNumber(process.env.DB_PORT, 5432),
        ...(ssl ? { ssl } : {})
    };
};

const runtimeRole = getRuntimeRole();
const totalDbConnections = parseNumber(process.env.DB_MAX_CONNECTIONS, 100);
const reservedConnections = parseNumber(process.env.DB_RESERVED_CONNECTIONS, 20);
const apiInstanceCount = Math.max(1, parseNumber(process.env.API_INSTANCE_COUNT || process.env.WEB_CONCURRENCY, 1));
const workerInstanceCount = Math.max(0, parseNumber(process.env.WORKER_INSTANCE_COUNT, 1));
const schedulerInstanceCount = Math.max(1, parseNumber(process.env.SCHEDULER_INSTANCE_COUNT, 1));
const totalRuntimeProcesses = Math.max(1, apiInstanceCount + workerInstanceCount + schedulerInstanceCount);
const usableConnections = Math.max(1, totalDbConnections - reservedConnections);
const derivedPoolMax = Math.max(
    1,
    Math.floor(usableConnections / totalRuntimeProcesses)
);
const rolePoolCaps = {
    api: 20,
    worker: 10,
    scheduler: 4
};
const rolePoolMins = {
    api: 2,
    worker: 1,
    scheduler: 1
};
const configuredPoolMax = parseNumber(
    process.env[`DB_POOL_MAX_${runtimeRole.toUpperCase()}`],
    parseNumber(process.env.DB_POOL_MAX, Math.min(derivedPoolMax, rolePoolCaps[runtimeRole] || 10))
);
const configuredPoolMin = parseNumber(
    process.env[`DB_POOL_MIN_${runtimeRole.toUpperCase()}`],
    parseNumber(process.env.DB_POOL_MIN, Math.min(rolePoolMins[runtimeRole] || 1, configuredPoolMax))
);

const poolConfig = {
    ...buildBasePoolConfig(),
    max: Math.max(1, configuredPoolMax),
    min: Math.min(configuredPoolMin, configuredPoolMax),
    idleTimeoutMillis: parseNumber(process.env.DB_POOL_IDLE_TIMEOUT_MS, 30000),
    connectionTimeoutMillis: parseNumber(process.env.DB_POOL_CONNECTION_TIMEOUT_MS, 5000),
    statement_timeout: parseNumber(process.env.DB_STATEMENT_TIMEOUT_MS, 15000),
    query_timeout: parseNumber(process.env.DB_QUERY_TIMEOUT_MS, 15000),
    idle_in_transaction_session_timeout: parseNumber(process.env.DB_IDLE_TX_TIMEOUT_MS, 10000),
    keepAlive: true,
    allowExitOnIdle: false,
    maxUses: parseNumber(process.env.DB_POOL_MAX_USES, 7500),
    application_name: process.env.DB_APPLICATION_NAME || `leadgen-${runtimeRole}-${process.pid}`
};

const pool = new Pool(poolConfig);

pool.on('connect', () => {
    logger.debug('[DB] Client connected', {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
    });
});

pool.on('error', (err) => {
    logger.error('[DB] Unexpected idle client error', {
        message: err.message,
        stack: err.stack
    });
});

const query = (text, params) => pool.query(text, params);

const checkDatabaseHealth = async () => {
    const startedAt = Date.now();

    try {
        await query('SELECT 1');
        return {
            status: 'UP',
            latencyMs: Date.now() - startedAt
        };
    } catch (error) {
        return {
            status: 'DOWN',
            latencyMs: Date.now() - startedAt,
            error: error.message
        };
    }
};

const getPoolStatus = () => ({
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
    max: pool.options.max,
    min: pool.options.min,
    role: runtimeRole,
    budget: {
        totalDbConnections,
        reservedConnections,
        usableConnections,
        totalRuntimeProcesses,
        apiInstanceCount,
        workerInstanceCount,
        schedulerInstanceCount,
        derivedPoolMax
    }
});

const closePool = async () => {
    await pool.end();
};

module.exports = {
    query,
    pool,
    poolConfig,
    getPoolStatus,
    checkDatabaseHealth,
    closePool
};
