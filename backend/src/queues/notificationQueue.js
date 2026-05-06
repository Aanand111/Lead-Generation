const { Queue } = require('bullmq');
const { getBullConnection } = require('../config/redis');
const logger = require('../utils/logger');

const notificationQueue = new Queue('notification-broadcast', {
    connection: getBullConnection(),
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000
        },
        removeOnComplete: true,
        removeOnFail: false
    }
});

const loggedQueueErrors = new Set();

// Prevent process crash if Redis is unavailable
notificationQueue.on('error', (error) => {
    const key = `error:${error.message}`;
    if (loggedQueueErrors.has(key)) return;
    
    loggedQueueErrors.add(key);
    logger.warn('[QUEUE] Notification queue connection error', {
        error: error.message
    });
    
    // Clear after some time to allow re-logging if problem persists but at lower frequency
    setTimeout(() => loggedQueueErrors.delete(key), 60000).unref();
});

const closeNotificationQueue = async () => {
    await notificationQueue.close();
};

module.exports = notificationQueue;
module.exports.closeNotificationQueue = closeNotificationQueue;
