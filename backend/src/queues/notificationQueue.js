const { Queue } = require('bullmq');
const { getBullConnection } = require('../config/redis');

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

const closeNotificationQueue = async () => {
    await notificationQueue.close();
};

module.exports = notificationQueue;
module.exports.closeNotificationQueue = closeNotificationQueue;
