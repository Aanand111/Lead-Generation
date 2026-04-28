const express = require('express');
const notificationsController = require('./notifications.controller');
const { protect } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', (req, res, next) => notificationsController.getMyNotifications(req, res, next));
router.put('/mark-read/:id', (req, res, next) => notificationsController.markAsRead(req, res, next));

module.exports = router;
