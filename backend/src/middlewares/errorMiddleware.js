const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    let status = err.statusCode || err.status || 500;
    let message = err.message || 'Internal Server Error';

    if (err.code === '23505') {
        status = err.constraint === 'unique_user_lead_purchase' ? 409 : 409;
        message = err.constraint === 'unique_user_lead_purchase'
            ? 'You have already purchased this lead.'
            : 'Selected record already exists.';
    }

    const requestLogger = req.logger || logger;
    requestLogger.error('[HTTP] Request failed', {
        method: req.method,
        url: req.originalUrl,
        status,
        message: err.message,
        stack: err.stack
    });

    res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = { errorHandler };
