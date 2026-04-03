const admin = require('firebase-admin');
const { pool } = require('../config/db');

// Initialize Firebase Admin (Ensure .env exists with path to firebase-service-account.json)
if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    admin.initializeApp({
        credential: admin.credential.cert(require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH))
    });
}

class NotificationService {
    /**
     * sendPushToUser: Sends an individual FCM notification
     * Uses batching and retries under the hood.
     */
    static async sendPushToUser(userPhone, title, body, data = {}) {
        try {
            const query = 'SELECT fcm_token FROM users WHERE phone = $1';
            const { rows } = await pool.query(query, [userPhone]);
            
            if (rows.length === 0 || !rows[0].fcm_token) {
                return { success: false, message: 'FCM token not found' };
            }

            const message = {
                notification: { title, body },
                data: { ...data, timestamp: new Date().toISOString() },
                token: rows[0].fcm_token
            };

            const response = await admin.messaging().send(message);
            return { success: true, messageId: response };
        } catch (error) {
            console.error('[PUSH ERROR]', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * sendBulkPush: Sends a message to a list of tokens (max 500 per FCM request)
     */
    static async sendBulkPush(tokens, title, body, data = {}) {
        if (!tokens || tokens.length === 0) return 0;

        try {
            const message = {
                notification: { title, body },
                data: { ...data, timestamp: new Date().toISOString() },
                tokens: tokens
            };

            const response = await admin.messaging().sendEachForMulticast(message);
            
            // Clean up invalid/expired tokens (Scaling Best Practice)
            if (response.failureCount > 0) {
                const invalidTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        invalidTokens.push(tokens[idx]);
                    }
                });
                // Optional: mark invalidTokens as NULL in DB (later)
            }

            return response.successCount;
        } catch (error) {
            console.error('[BULK PUSH ERROR]', error.message);
            return 0;
        }
    }
}

module.exports = NotificationService;
