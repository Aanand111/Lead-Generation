const express = require('express');
const { 
    getDashboardStats, getAvailableLeads, purchaseLead, 
    purchaseSubscriptionPlan,
    getMyLeads, getProfile, updateProfile, 
    getSubscriptionPlans, getReferralStats, 
    getNews, getBanners, getPosters, getPosterTemplates, generatePoster,
    submitLeadFeedback
} = require('../controllers/userController');
const { createSubscriptionOrder, verifySubscriptionPayment } = require('../controllers/DRozeerpayController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

console.log('[DEBUG] Initializing User Subscription Routes...');

const router = express.Router();

// Protected User Routes
router.use(authenticateToken);
router.use(authorizeRole(['user', 'vendor', 'customer', 'admin']));

router.get('/dashboard-stats', getDashboardStats);
router.get('/available-leads', getAvailableLeads);
router.post('/purchase-lead/:id', purchaseLead);
router.post('/purchase-subscription/:id', purchaseSubscriptionPlan);

// Razorpay Subscription Routes
router.post('/subscription/create-order', createSubscriptionOrder);
router.post('/subscription/verify-payment', verifySubscriptionPayment);

router.get('/my-leads', getMyLeads);
router.get('/referral-stats', getReferralStats);
router.get('/subscription-plans', getSubscriptionPlans);
router.get('/posters', getPosters);
router.get('/poster-templates', getPosterTemplates);

const { fileUpload } = require('../config/cloudinary');
router.post('/generate-poster', fileUpload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]), generatePoster);

router.post('/lead-feedback', submitLeadFeedback);
const { recordBannerInteraction } = require('../controllers/adminAnalyticsController');
router.post('/banners/:id/interaction', recordBannerInteraction);
router.get('/news', getNews);
router.get('/banners', getBanners);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
