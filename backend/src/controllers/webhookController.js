const logger = require('../utils/logger');
const leadsRepository = require('../modules/leads/leads.repository');
const socketGateway = require('../utils/socket');

/**
 * Controller to handle Facebook/Instagram Lead Ad Webhooks
 */
class WebhookController {
    
    /**
     * GET /api/webhooks/facebook
     * Verification endpoint for Meta Webhook setup
     */
    async verifyFacebook(req, res) {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'lead_gen_secret_token';

        if (mode && token) {
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                logger.info('[WEBHOOK] Facebook verified successfully');
                return res.status(200).send(challenge);
            } else {
                return res.sendStatus(403);
            }
        }
    }

    /**
     * POST /api/webhooks/facebook
     * Receives lead data from Meta
     */
    async handleFacebookLead(req, res) {
        const body = req.body;

        if (body.object === 'page') {
            body.entry.forEach(async (entry) => {
                const changes = entry.changes;
                changes.forEach(async (change) => {
                    if (change.field === 'leadgen') {
                        const leadId = change.value.leadgen_id;
                        const pageId = change.value.page_id;
                        
                        logger.info('[WEBHOOK] New Facebook Lead received', { leadId, pageId });

                        // In a real scenario, we would now call Meta Graph API to get details
                        // For now, we will log it and create a placeholder in the DB
                        try {
                            // This is where you'd use axios to fetch details using FACEBOOK_PAGE_ACCESS_TOKEN
                            // const details = await fetchMetaLeadDetails(leadId);
                            
                            // Mocking the data for demonstration
                            const mockLead = {
                                lead_id: `FB-${leadId}`,
                                customer_name: 'Facebook User',
                                customer_phone: 'Pending Sync',
                                category: 'FACEBOOK_AD',
                                status: 'PENDING'
                            };

                            // Save to DB (using existing repository)
                            // await leadsRepository.createLead(mockLead, 0); // 0 or specific admin ID
                            
                            // Notify Admin via Socket
                            socketGateway.broadcast('notification', {
                                title: 'New Facebook Lead!',
                                message: `A new lead has been captured from your Facebook Ad campaign.`,
                                type: 'success'
                            });

                        } catch (err) {
                            logger.error('[WEBHOOK] Failed to process Facebook lead', err);
                        }
                    }
                });
            });

            res.status(200).send('EVENT_RECEIVED');
        } else {
            res.sendStatus(404);
        }
    }
}

module.exports = new WebhookController();
