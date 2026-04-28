const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Correlation ID Middleware
 * Assigns a unique ID to each request and attaches it to the response header
 * and the logger context for traceability.
 */
const correlationMiddleware = (req, res, next) => {
    const correlationId = req.header('X-Correlation-ID') || crypto.randomUUID();
    
    req.correlationId = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);

    // Create a child logger for this request
    req.logger = logger.child({ correlationId });

    next();
};

module.exports = correlationMiddleware;
