const express = require('express');
const subscriptionsController = require('./subscriptions.controller');
const { protect } = require('../../middlewares/authMiddleware');
const cache = require('../../middlewares/cacheMiddleware');

const router = express.Router();

router.use(protect);

router.get('/plans', cache(3600), (req, res, next) => subscriptionsController.getPlans(req, res, next));
router.post('/purchase/:id', (req, res, next) => subscriptionsController.purchasePlan(req, res, next));

module.exports = router;
