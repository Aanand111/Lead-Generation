const { pool } = require('../config/db');
const BulkProcessor = require('../utils/bulkJobProcessor');
const NotificationService = require('../services/notificationService');

const createBroadcast = async (req, res, next) => {
    try {
        const { title, body, role = 'user' } = req.body;

        if (!title || !body) {
            return res.status(400).json({ success: false, message: 'Title and Body are required' });
        }

        // 1. Create Campaign Record
        const { rows } = await pool.query(
            'INSERT INTO broadcast_campaigns (title, body, target_role, status) VALUES ($1, $2, $3, $4) RETURNING id',
            [title, body, role, 'PENDING']
        );
        const campaignId = rows[0].id;

        // 2. Start Processing in background (Non-blocking)
        // ── STEP A: INSTANT REALTIME BROADCAST ──
        // This hits all ONLINE users in < 1 second!
        NotificationService.sendGlobalNotification(title, body, { campaignId });

        // ── STEP B: MASS DELIVERY ──
        // This processes all 1M users (Online + Offline) via Queue
        processBroadcast(campaignId, { title, body, role });

        res.status(202).json({
            success: true,
            message: 'Broadcast campaign initiated successfully',
            campaign_id: campaignId,
            tracking_url: `/api/admin/broadcast/${campaignId}`
        });
    } catch (error) {
        next(error);
    }
};

const notificationQueue = require('../queues/notificationQueue');

/**
 * processBroadcast: Enqueues each user to the BullMQ system.
 * This is the ONLY safe way to send 1 Million messages without crash or loss.
 */
const processBroadcast = async (campaignId, { title, body, role }) => {
    try {
        await pool.query('UPDATE broadcast_campaigns SET status = $1, started_at = NOW() WHERE id = $2', ['PROCESSING', campaignId]);

        let totalEnqueued = 0;

        // Fetch users in large batches and use addBulk for Redis
        await BulkProcessor.processUsersInBatches({
            batchSize: 1000, 
            role: role,
            handler: async (batchRows) => {
              // batchRows is an array of users from the DB
              const jobs = batchRows.map(user => ({
                name: 'broadcast-job',
                data: {
                  userId: user.id,
                  userPhone: user.phone,
                  title,
                  body,
                  campaignId
                },
                opts: {
                  jobId: `${campaignId}-${user.id}`
                }
              }));

              // Send 1000 jobs to Redis in ONE call!
              await notificationQueue.addBulk(jobs);
              totalEnqueued += jobs.length;

              // Periodic progress update
              if (totalEnqueued % 10000 === 0) {
                 await pool.query('UPDATE broadcast_campaigns SET total_users = $1 WHERE id = $2', [totalEnqueued, campaignId]);
              }
            },
            useBatchHandler: true // Custom flag to pass whole batch to handler
        });

        // Final count update
        await pool.query(
          'UPDATE broadcast_campaigns SET total_users = $1 WHERE id = $2', 
          [totalEnqueued, campaignId]
        );

        // BullMQ workers across all cores will handle the rest!
    } catch (error) {
        console.error('[ENQUEUE ERROR]', error);
        await pool.query('UPDATE broadcast_campaigns SET status = $1 WHERE id = $2', ['FAILED', campaignId]);
    }
};

const getCampaignStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('SELECT * FROM broadcast_campaigns WHERE id = $1', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }

        res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBroadcast,
    getCampaignStatus
};
