const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    let status = err.statusCode || err.status || 500;
    
    // Custom error message for production
    let message = err.message || 'Internal Server Error';

    // Unique constraint violation in Postgres
    if (err.code === '23505') {
        status = 400;
        message = 'Selected record/name already exists.';
    }

    // Log the error using winston
    logger.error({
        method: req.method,
        url: req.originalUrl,
        status,
        message: err.message,
        stack: err.stack,
    });

    // Client response
    res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = { errorHandler };
