const express = require('express');
const leadsController = require('./leads.controller');
const { protect } = require('../../middlewares/authMiddleware');
const cache = require('../../middlewares/cacheMiddleware');

const router = express.Router();

router.use(protect); // All lead routes require auth

router.get('/available', cache(15), (req, res, next) => leadsController.getAvailableLeads(req, res, next));
router.post('/purchase/:id', (req, res, next) => leadsController.purchaseLead(req, res, next));
router.post('/submit', (req, res, next) => leadsController.submitLead(req, res, next));

module.exports = router;
