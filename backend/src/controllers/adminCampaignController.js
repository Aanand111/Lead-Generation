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
        // Note: For TRUE 1M+ users production, use bullmq here. This is a robust batch implementation.
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

        // Use BulkProcessor to safely iterate 1M users and ADD TO QUEUE (Seek Method)
        await BulkProcessor.processUsersInBatches({
            batchSize: 5000, // Fetch large batches to enqueue fast
            role: role,
            handler: async (user) => {
              totalEnqueued++;
              
              // ── ENQUEUE TO BULLMQ (Scale-Ready) ──
              // Job is now safe in Redis. A worker on ANY CPU core will pick this up!
              await notificationQueue.add('broadcast-job', {
                userId: user.id,
                userPhone: user.phone,
                title,
                body,
                campaignId
              }, {
                jobId: `${campaignId}-${user.id}` // Avoid double-sending
              });

              // Intermittent update to DB for admin tracking
              if (totalEnqueued % 10000 === 0) {
                 await pool.query('UPDATE broadcast_campaigns SET total_users = $1 WHERE id = $2', [totalEnqueued, campaignId]);
              }
            }
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
