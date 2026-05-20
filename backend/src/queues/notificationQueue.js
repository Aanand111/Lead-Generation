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

/**
 * enqueueLeadApprovalNotification
 *
 * Adds a single background job to notify users about a newly approved lead.
 * The worker will handle:
 *   - Push to users in the same city (priority)
 *   - Push to all other active users
 *   - Push to the lead uploader (confirmation)
 *   - Socket.io broadcast
 *
 * @param {object} lead         - The approved lead record from DB
 * @param {string} uploaderName - Display name of whoever uploaded the lead
 */
const enqueueLeadApprovalNotification = async (lead, uploaderName) => {
    try {
        await notificationQueue.add(
            'lead-approved-notify',
            {
                leadId: lead.id,
                city: lead.city,
                category: lead.category,
                pincode: lead.pincode,
                createdBy: lead.created_by,
                uploaderName: uploaderName || 'A Partner'
            },
            {
                // High priority — process before regular broadcast jobs
                priority: 1,
                attempts: 2,
                backoff: { type: 'fixed', delay: 10000 }
            }
        );
        logger.info('[QUEUE] Lead approval notification job enqueued', {
            leadId: lead.id,
            city: lead.city
        });
    } catch (err) {
        // Queue failure must NEVER break the lead approval response
        logger.error('[QUEUE] Failed to enqueue lead approval notification', {
            leadId: lead.id,
            message: err.message
        });
    }
};

const closeNotificationQueue = async () => {
    await notificationQueue.close();
};

module.exports = notificationQueue;
module.exports.closeNotificationQueue = closeNotificationQueue;
module.exports.enqueueLeadApprovalNotification = enqueueLeadApprovalNotification;
