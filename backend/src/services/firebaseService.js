const admin = require('firebase-admin');
const logger = require('../utils/logger');

let firebaseApp = null;

const initializeFirebase = () => {
    if (firebaseApp) return firebaseApp;

    try {
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        const hasCredentials = serviceAccountPath || process.env.FIREBASE_PROJECT_ID;

        if (!hasCredentials) {
            logger.warn('[FIREBASE] No credentials provided. Firebase service running in mock/offline mode.');
            return null;
        }

        const config = {};
        if (serviceAccountPath) {
            config.credential = admin.credential.cert(require(serviceAccountPath));
        } else {
            config.projectId = process.env.FIREBASE_PROJECT_ID;
        }

        firebaseApp = admin.initializeApp(config);
        logger.info('[FIREBASE] Admin SDK initialized successfully');
        return firebaseApp;
    } catch (error) {
        logger.error('[FIREBASE] Failed to initialize Admin SDK', { error: error.message });
        return null;
    }
};

/**
 * sendMulticastNotifications
 * Partition large recipient lists into chunks of 500 tokens (Task 11) to comply with Firebase limits.
 */
const sendMulticastNotifications = async (tokens, title, body, data = {}) => {
    const app = initializeFirebase();
    if (!app || !tokens || tokens.length === 0) {
        return { success: false, sentCount: 0, message: 'Firebase not initialized or no tokens provided' };
    }

    const uniqueTokens = [...new Set(tokens)].filter(Boolean);
    const BATCH_LIMIT = 500; // FCM multicast limit
    let successCount = 0;
    let failureCount = 0;

    const batches = [];
    for (let i = 0; i < uniqueTokens.length; i += BATCH_LIMIT) {
        batches.push(uniqueTokens.slice(i, i + BATCH_LIMIT));
    }

    logger.info('[FIREBASE] Enqueuing multicast push campaign', {
        totalTokens: uniqueTokens.length,
        totalBatches: batches.length
    });

    const payload = {
        notification: { title, body },
        data: Object.keys(data).reduce((acc, key) => {
            acc[key] = String(data[key]);
            return acc;
        }, {})
    };

    const results = await Promise.allSettled(
        batches.map(async (tokenBatch) => {
            const message = {
                tokens: tokenBatch,
                ...payload
            };
            return admin.messaging().sendEachForMulticast(message);
        })
    );

    results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
            const response = result.value;
            successCount += response.successCount;
            failureCount += response.failureCount;

            if (response.failureCount > 0) {
                logger.warn(`[FIREBASE] Batch ${idx + 1} had ${response.failureCount} delivery failures`);
            }
        } else {
            logger.error(`[FIREBASE] Batch ${idx + 1} failed completely`, {
                error: result.reason?.message
            });
            failureCount += batches[idx].length;
        }
    });

    return {
        success: successCount > 0,
        sentCount: successCount,
        failedCount: failureCount,
        totalProcessed: uniqueTokens.length
    };
};

module.exports = {
    initializeFirebase,
    sendMulticastNotifications
};
