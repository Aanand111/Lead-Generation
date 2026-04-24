const express = require('express');
const { uploadLead, getLeads, editLead, removeLead, getPurchasedLeads, getPendingLeads, approveLead, getLead } = require('../controllers/adminLeadController');
const { addPackage, editPackage, getPackages, removePackage } = require('../controllers/adminPackageController');
const { addBanner, editBanner, getBanners, removeBanner, recordBannerClick } = require('../controllers/adminBannerController');
// const { getVendors, addVendor, updateVendorStatus, removeVendor } = require('../controllers/vendorController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const {
    vendorSchema,
    subVendorSchema,
    leadSchema,
    customerSchema,
    categorySchema,
    bannerSchema,
    newsSchema,
    posterSchema,
    packageSchema,
    subscriptionPlanSchema,
    subscriptionSchema,
    transactionSchema,
    walletUpdateSchema,
    blockUserSchema
} = require('../utils/validators');


const router = express.Router();

// Apply middleware to all routes in this file
router.use(protect);
router.use(adminOnly);

// User Management Routes
const { fileUpload } = require('../config/cloudinary');
const { getUsers, blockUser, updateWallet, getReferralTree, uploadProfilePhoto, updateProfile, updateVendorCommission, fetchCommissions, handleCommissionApproval, handleCommissionRejection } = require('../controllers/adminUserController');

// Diagnostic Heartbeat
router.get('/ping-check', (req, res) => res.status(200).json({ success: true, message: 'Admin protocol active' }));

// Commission Audit & Verification
router.get('/commissions', fetchCommissions);
router.put('/commissions/:id/approve', handleCommissionApproval);
router.put('/commissions/:id/reject', handleCommissionRejection);

router.put('/vendor-commission/:id', updateVendorCommission);

router.get('/users', getUsers);
router.put('/profile', updateProfile);
router.put('/users/:id/block', validate(blockUserSchema), blockUser);
router.put('/users/:id/wallet', validate(walletUpdateSchema), updateWallet);
router.get('/users/:id/referrals', getReferralTree);

// Profile photo upload internally configured with cloudinary
router.post('/upload-photo', fileUpload.single('file'), uploadProfilePhoto);

// Lead Management Routes
const { getAvailableLeads, assignLeads, suggestBestMatch } = require('../controllers/availableLeadsController');
router.post('/leads', validate(leadSchema), uploadLead);
router.get('/leads', getLeads);
router.get('/leads/pending', getPendingLeads);
router.get('/leads-purchased', getPurchasedLeads);
router.get('/leads/:id', getLead);
router.put('/leads/:id/approve', approveLead);
router.get('/available-leads', getAvailableLeads);
router.get('/leads/:lead_id/suggest-match', suggestBestMatch);
router.post('/assign-leads', assignLeads);
router.put('/leads/:id', validate(leadSchema), editLead);
router.delete('/leads/:id', removeLead);

// Lead Category Management Routes
const { addLeadCategory, getLeadCategories, editLeadCategory, removeLeadCategory } = require('../controllers/adminLeadCategoryController');
router.post('/lead-categories', validate(categorySchema), addLeadCategory);
router.get('/lead-categories', getLeadCategories);
router.put('/lead-categories/:id', validate(categorySchema), editLeadCategory);
router.delete('/lead-categories/:id', removeLeadCategory);

// News Category Management Routes
const { addNewsCategory, getNewsCategories, editNewsCategory, removeNewsCategory } = require('../controllers/adminNewsCategoryController');
router.post('/news-categories', validate(categorySchema), addNewsCategory);
router.get('/news-categories', getNewsCategories);
router.put('/news-categories/:id', validate(categorySchema), editNewsCategory);
router.delete('/news-categories/:id', removeNewsCategory);

// Poster Category Management Routes
const { addPosterCategory, getPosterCategories, editPosterCategory, removePosterCategory } = require('../controllers/adminPosterCategoryController');
router.post('/poster-categories', validate(categorySchema), addPosterCategory);
router.get('/poster-categories', getPosterCategories);
router.put('/poster-categories/:id', validate(categorySchema), editPosterCategory);
router.delete('/poster-categories/:id', removePosterCategory);

// News Management Routes
const { addNews, getNews, editNews, removeNews } = require('../controllers/adminNewsController');
router.post('/news', fileUpload.single('image'), validate(newsSchema), addNews);
router.get('/news', getNews);
router.put('/news/:id', fileUpload.single('image'), validate(newsSchema), editNews);
router.delete('/news/:id', removeNews);

// Poster Management Routes
const { addPoster, getPosters, editPoster, removePoster } = require('../controllers/adminPosterController');
router.post('/poster-management', fileUpload.single('thumbnail'), validate(posterSchema), addPoster);
router.get('/poster-management', getPosters);
router.put('/poster-management/:id', fileUpload.single('thumbnail'), validate(posterSchema), editPoster);
router.delete('/poster-management/:id', removePoster);


// Packages & Pricing Routes
router.post('/packages', validate(packageSchema), addPackage);
router.put('/packages/:id', validate(packageSchema), editPackage);
router.get('/packages', getPackages);
router.delete('/packages/:id', removePackage);

// Offer Banner Management Routes
router.post('/banners', validate(bannerSchema), addBanner);
router.put('/banners/:id', validate(bannerSchema), editBanner);
router.get('/banners', getBanners);
router.delete('/banners/:id', removeBanner);
router.post('/banners/:id/click', recordBannerClick); // Can be moved to user routes later but keeping it here for admin verification too.

// Customer Management Routes (Isolated from Users)
const { getCustomers, getCustomer, addCustomer, updateCustomer, updateCustomerStatus, removeCustomer } = require('../controllers/customerController');
router.post('/customers', validate(customerSchema), addCustomer);
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomer);
router.put('/customers/:id', validate(customerSchema), updateCustomer);
router.put('/customers/:id/status', updateCustomerStatus);
router.delete('/customers/:id', removeCustomer);

// Vendor Management Routes (Isolated from Users)
const { getVendors, addVendor, updateVendorStatus, removeVendor, updateVendor, getVendorStats } = require('../controllers/vendorController');
router.post('/vendors', validate(vendorSchema), addVendor);
router.get('/vendors', getVendors);
router.get('/vendors/:id/stats', getVendorStats);
router.put('/vendors/:id/status', updateVendorStatus);
router.put('/vendors/:id', validate(vendorSchema), updateVendor);
router.delete('/vendors/:id', removeVendor);

// Sub Vendor Management Routes
const { getSubVendors, addSubVendor, updateSubVendor, removeSubVendor } = require('../controllers/subVendorController');
router.post('/subvendors', validate(subVendorSchema), addSubVendor);
router.get('/subvendors', getSubVendors);
router.put('/subvendors/:id', validate(subVendorSchema), updateSubVendor);
router.delete('/subvendors/:id', removeSubVendor);

// Contact Message Management Routes (Admin)
const { getMessages, updateStatus, deleteMessage } = require('../controllers/contactController');
router.get('/contact-messages', getMessages);
router.put('/contact-messages/:id/status', updateStatus);
router.delete('/contact-messages/:id', deleteMessage);

// Subscription Plan Management Routes
const {
    getSubscriptionPlans,
    getSubscriptionPlanById,
    addSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
} = require('../controllers/subscriptionPlanController');
router.get('/subscription-plans', getSubscriptionPlans);
router.get('/subscription-plans/:id', getSubscriptionPlanById);
router.post('/subscription-plans', validate(subscriptionPlanSchema), addSubscriptionPlan);
router.put('/subscription-plans/:id', validate(subscriptionPlanSchema), updateSubscriptionPlan);
router.delete('/subscription-plans/:id', deleteSubscriptionPlan);

// Subscription Management Routes
const {
    getSubscriptions,
    getSubscriptionById,
    addSubscription,
    updateSubscription,
    deleteSubscription,
} = require('../controllers/subscriptionController');
router.get('/subscriptions', getSubscriptions);
router.get('/subscriptions/:id', getSubscriptionById);
router.post('/subscriptions', validate(subscriptionSchema), addSubscription);
router.put('/subscriptions/:id', validate(subscriptionSchema), updateSubscription);
router.delete('/subscriptions/:id', deleteSubscription);

// Transaction Management Routes
const { getTransactions, getTransactionById, createTransaction } = require('../controllers/adminTransactionController');
router.get('/transactions', getTransactions);
router.get('/transactions/:id', getTransactionById);
router.post('/transactions', validate(transactionSchema), createTransaction);

// Payout Management Routes
router.get('/test-ping', (req, res) => res.json({ success: true, message: 'Admin layer active' }));

// Dashboard Stats Route
const { getStats } = require('../controllers/adminStatsController');
router.get('/stats', getStats);

// System Settings Routes
const { getSettings, updateSettings, getSettingByKey } = require('../controllers/adminSettingsController');
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/settings/:key', getSettingByKey);

// Broadcast Campaign Routes (1M+ Scaling)
const { createBroadcast, getCampaignStatus } = require('../controllers/adminCampaignController');
router.post('/broadcast', createBroadcast);
router.get('/broadcast/:id', getCampaignStatus);

// Feedback & Quality Control Routes (Quality Loop)
const { fetchFeedback, resolveFeedback, getVendorPerformance } = require('../controllers/adminFeedbackController');
router.get('/feedback', fetchFeedback);
router.put('/feedback/:id', resolveFeedback);
router.get('/vendors-performance', getVendorPerformance);

// Analytics & Metrics Routes (Granular Reports)
const { fetchGranularAnalytics, recordBannerInteraction, getLeadReports, exportDetailedReports } = require('../controllers/adminAnalyticsController');
const { sendTargetedNotification } = require('../controllers/adminNotificationController');
router.get('/analytics/granular', fetchGranularAnalytics);
router.get('/analytics/lead-reports', getLeadReports);
router.get('/analytics/export-leads', exportDetailedReports);

router.post('/notifications/send', sendTargetedNotification);

const { runAllMaintenanceTasks } = require('../jobs/maintenanceJobs');
router.post('/system/maintenance-trigger', async (req, res) => {
    try {
        await runAllMaintenanceTasks();
        res.status(200).json({ success: true, message: 'Maintenance tasks initiated successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Maintenance failed: ' + err.message });
    }
});
router.post('/banners/:id/interaction', recordBannerInteraction);

module.exports = router;
