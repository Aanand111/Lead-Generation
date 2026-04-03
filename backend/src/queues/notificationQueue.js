const { Queue } = require('bullmq');
const { redisOptions } = require('../config/redis');

// Job persistence: Messages are stored in Redis until processed (Safe scaling)
const notificationQueue = new Queue('notification-broadcast', {
  connection: redisOptions,
  defaultJobOptions: {
    attempts: 3,             // Retry 3 times if notification fails
    backoff: {
      type: 'exponential',
      delay: 5000,           // Wait 5s, then 10s, 20s...
    },
    removeOnComplete: true,  // Clean up Redis after success
    removeOnFail: false,     // Keep failures for admin review
  }
});

module.exports = notificationQueue;
