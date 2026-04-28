const winston = require('winston');
const path = require('path');

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
        ({ level, message, timestamp, stack, correlationId }) => {
            const id = correlationId ? ` [${correlationId}]` : '';
            return `${timestamp}${id} ${level}: ${stack || message}`;
        }
    )
);

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: 'lead-gen-api' },
    transports: [
        // Write all logs with level 'error' and below to error.log
        new winston.transports.File({ 
            filename: path.join('logs', 'error.log'), 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write all logs with level 'info' and below to combined.log
        new winston.transports.File({ 
            filename: path.join('logs', 'combined.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 5,
        }),
    ],
});

// If not in production, log to the console with colors
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat,
    }));
}

module.exports = logger;
