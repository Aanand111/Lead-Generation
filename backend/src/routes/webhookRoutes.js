const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Meta Webhook Verification
router.get('/facebook', (req, res) => webhookController.verifyFacebook(req, res));

// Meta Webhook Lead Event
router.post('/facebook', (req, res) => webhookController.handleFacebookLead(req, res));

module.exports = router;
