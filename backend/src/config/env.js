require('dotenv').config();

const PLACEHOLDER_VALUES = new Set([
    '',
    'changeme',
    'change-me',
    'your_secret_key',
    'your_super_secret_jwt_key_at_least_32_chars',
    'rzp_test_your_id',
    'your_cloud_name',
    'your_api_key',
    'your_api_secret',
    'your_secure_password'
]);

const parseNumber = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBoolean = (value, fallback = false) => {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }

    return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
};

const parseCsv = (value) => {
    if (!value) {
        return [];
    }

    return String(value)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
};

const isProduction = () => (process.env.NODE_ENV || 'development') === 'production';

const hasDatabaseUrl = () => Boolean(process.env.DATABASE_URL);
const hasRedisConfig = () => Boolean(process.env.REDIS_URL || process.env.REDIS_HOST);

const isPlaceholder = (value) => !value || PLACEHOLDER_VALUES.has(String(value).trim());
const getRuntimeRole = () => process.env.RUNTIME_ROLE || 'api';

const validatePositiveNumber = (envName, fallback, { allowZero = false } = {}) => {
    const rawValue = process.env[envName];
    const parsed = parseNumber(rawValue, fallback);
    const minimum = allowZero ? 0 : 1;

    if (!Number.isFinite(parsed) || parsed < minimum) {
        console.error(`\n[FATAL] ${envName} must be a ${allowZero ? 'non-negative' : 'positive'} integer.\n`);
        process.exit(1);
    }

    return parsed;
};

const validateEnv = () => {
    const requiredEnvs = ['JWT_SECRET'];
    const runtimeRole = getRuntimeRole();

    if (!hasDatabaseUrl()) {
        requiredEnvs.push('DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT');
    }

    const redisRequiredForRuntime = runtimeRole === 'worker' || runtimeRole === 'scheduler';
    if ((isProduction() || redisRequiredForRuntime) && !hasRedisConfig()) {
        requiredEnvs.push('REDIS_HOST');
    }

    const missing = requiredEnvs.filter((envName) => !process.env[envName]);

    if (missing.length > 0) {
        console.error('\n[FATAL] Missing Required Environment Variables:');
        missing.forEach((envName) => console.error(` - ${envName}`));
        console.error('\nPlease check your environment configuration. Server shutting down...\n');
        process.exit(1);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (isPlaceholder(jwtSecret)) {
        console.error('\n[FATAL] JWT_SECRET is missing or still using a placeholder value.\n');
        process.exit(1);
    }

    if (jwtSecret.length < 32) {
        const message = '\n[WARNING] JWT_SECRET is too short. Use at least 32 characters for production security.\n';
        if (isProduction()) {
            console.error(message);
            process.exit(1);
        }
        console.warn(message);
    }

    if (isProduction() && process.env.REDIS_HOST === 'localhost' && !process.env.REDIS_URL) {
        console.warn('\n[WARNING] Production is configured to use localhost Redis. This will not scale across instances.\n');
    }

    validatePositiveNumber('DB_MAX_CONNECTIONS', 100);
    validatePositiveNumber('DB_RESERVED_CONNECTIONS', 20, { allowZero: true });
    validatePositiveNumber('API_INSTANCE_COUNT', 1);
    validatePositiveNumber('WORKER_INSTANCE_COUNT', 1, { allowZero: true });
    validatePositiveNumber('SCHEDULER_INSTANCE_COUNT', 1);

    if (parseNumber(process.env.DB_RESERVED_CONNECTIONS, 20) >= parseNumber(process.env.DB_MAX_CONNECTIONS, 100)) {
        console.error('\n[FATAL] DB_RESERVED_CONNECTIONS must be smaller than DB_MAX_CONNECTIONS.\n');
        process.exit(1);
    }

    if (!['api', 'worker', 'scheduler'].includes(runtimeRole)) {
        console.error('\n[FATAL] RUNTIME_ROLE must be one of: api, worker, scheduler.\n');
        process.exit(1);
    }

    console.log('Environment variables validated.');
};

module.exports = {
    validateEnv,
    parseNumber,
    parseBoolean,
    parseCsv,
    isProduction,
    hasRedisConfig,
    getRuntimeRole
};
