const express = require('express');
const userController = require('../modules/user/user.controller');
const { createSubscriptionOrder, verifySubscriptionPayment } = require('../controllers/DRozeerpayController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');
const cache = require('../middlewares/cacheMiddleware');
const { recordBannerInteraction } = require('../controllers/adminAnalyticsController');
const leadsController = require('../modules/leads/leads.controller');
const subscriptionsController = require('../modules/subscriptions/subscriptions.controller');
const { fileUpload } = require('../config/cloudinary');
const logger = require('../utils/logger');

const router = express.Router();

// Protected User Routes
router.use(authenticateToken);
router.use(authorizeRole(['user', 'vendor', 'customer', 'admin']));

router.get('/dashboard-stats', cache(30), (req, res, next) => userController.getDashboardStats(req, res, next));
router.post('/profile-picture', fileUpload.single('image'), (req, res, next) => {
    logger.info(`[USER ROUTE] Profile picture upload attempt for user ${req.user.id}`);
    userController.updateProfilePicture(req, res, next);
});

// Modular Leads (Phase 2)
router.use('/leads', require('../modules/leads/leads.routes'));
// Modular Subscriptions (Phase 2)
router.use('/subscriptions', require('../modules/subscriptions/subscriptions.routes'));

// Maintain backward compatibility for old paths if needed, 
// or redirect them to the new service logic:
router.get('/available-leads', (req, res, next) => leadsController.getAvailableLeads(req, res, next));
router.post('/purchase-lead/:id', (req, res, next) => leadsController.purchaseLead(req, res, next));
router.get('/subscription-plans', (req, res, next) => subscriptionsController.getPlans(req, res, next));
router.post('/purchase-subscription/:id', (req, res, next) => subscriptionsController.purchasePlan(req, res, next));

// Razorpay Subscription Routes
router.post('/subscription/create-order', createSubscriptionOrder);
router.post('/subscription/verify-payment', verifySubscriptionPayment);

router.get('/my-leads', (req, res, next) => userController.getMyLeads(req, res, next));
router.get('/my-uploaded-leads', (req, res, next) => userController.getMyUploadedLeads(req, res, next));
router.get('/referral-stats', (req, res, next) => userController.getReferralStats(req, res, next));
router.get('/posters', (req, res, next) => userController.getPosters(req, res, next));
router.get('/poster-templates', (req, res, next) => userController.getPosterTemplates(req, res, next));

router.post('/generate-poster', fileUpload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]), (req, res, next) => userController.generatePoster(req, res, next));

router.post('/lead-feedback', (req, res, next) => userController.submitLeadFeedback(req, res, next));
router.post('/banners/:id/interaction', recordBannerInteraction);
router.get('/news', cache(900), (req, res, next) => userController.getNews(req, res, next));
router.get('/banners', cache(900), (req, res, next) => userController.getBanners(req, res, next));
router.get('/profile', (req, res, next) => userController.getProfile(req, res, next));
router.put('/profile', (req, res, next) => userController.updateProfile(req, res, next));

module.exports = router;
