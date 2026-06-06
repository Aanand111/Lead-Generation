const winston = require('winston');
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', '..', 'logs');

const ensureLogsDir = () => {
    try {
        fs.mkdirSync(logsDir, { recursive: true });
        return true;
    } catch (error) {
        return false;
    }
};

// Custom format for logs
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(
        (info) => {
            const { level, message, timestamp, stack, correlationId, ...meta } = info;
            const id = correlationId ? ` [${correlationId}]` : '';
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
            return `${timestamp}${id} ${level}: ${stack || message}${metaStr}`;
        }
    )
);

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: 'lead-gen-api' },
    exitOnError: false,
    transports: [
        // Keep the process alive even if file logging is unavailable.
    ],
});

const attachSafeFileTransport = (options) => {
    if (!ensureLogsDir()) {
        return null;
    }

    try {
        const transport = new winston.transports.File({
            ...options,
            filename: path.join(logsDir, options.filename)
        });

        transport.on('error', (error) => {
            logger.remove(transport);
            try {
                transport.close();
            } catch (closeError) {
                // ignore close errors while disabling the transport
            }

            console.warn('[LOGGER] File transport disabled:', transport.filename, error.message);
        });

        logger.add(transport);
        return transport;
    } catch (error) {
        logger.warn('[LOGGER] Unable to enable file transport', {
            filename: options.filename,
            message: error.message
        });
        return null;
    }
};

logger.on('error', (error) => {
    if (error && error.message) {
        // eslint-disable-next-line no-console
        console.error('[LOGGER] Unhandled logger error:', error.message);
    }
});

attachSafeFileTransport({
    filename: 'error.log',
    level: 'error',
    maxsize: 5242880,
    maxFiles: 5
});

attachSafeFileTransport({
    filename: 'combined.log',
    maxsize: 10485760,
    maxFiles: 5
});

// If not in production, log to the console with colors
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat,
    }));
}

module.exports = logger;
