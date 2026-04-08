// const { Queue } = require('bullmq');
// const { redisOptions } = require('../config/redis');

// // Job persistence: Messages are stored in Redis until processed (Safe scaling)
// const notificationQueue = new Queue('notification-broadcast', {
//   connection: redisOptions,
//   defaultJobOptions: {
//     attempts: 3,             // Retry 3 times if notification fails
//     backoff: {
//       type: 'exponential',
//       delay: 5000,           // Wait 5s, then 10s, 20s...
//     },
//     removeOnComplete: true,  // Clean up Redis after success
//     removeOnFail: false,     // Keep failures for admin review
//   }
// });

// module.exports = notificationQueue;



const { Queue } = require('bullmq');
const Redis = require('ioredis');

// Use Railway REDIS_URL if available, otherwise fallback to individual host/port/password
const connection = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL) // Railway deployment
    : new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
          maxRetriesPerRequest: null,
      });

// Notification queue
const notificationQueue = new Queue('notification-broadcast', {
  connection,  // Pass the Redis instance directly
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  }
});

module.exports = notificationQueue;