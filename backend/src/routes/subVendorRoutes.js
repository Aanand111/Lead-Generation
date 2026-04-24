const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { leadSchema } = require('../utils/validators');
const { uploadLead } = require('../controllers/adminLeadController');
const { 
    getSubVendorStats, 
    getSubVendorReferrals, 
    getSubVendorEarnings,
    requestSettlement,
    approveReferral
} = require('../controllers/subVendorPanelController');

// All sub-vendor routes are protected
router.use(protect);

// Check if user is a sub-vendor (Middleware could be added here or inside controller)
// dashboard stats
router.get('/stats', getSubVendorStats);

// Referral management (Only for Users)
router.get('/referrals', getSubVendorReferrals);

// Earnings & Wallet
router.get('/earnings', getSubVendorEarnings);
router.post('/request-settlement', requestSettlement);
router.post('/approve-referral/:referralId', approveReferral);

// Lead Injection (Sub-vendors can also contribute leads)
router.post('/leads', validate(leadSchema), uploadLead);

module.exports = router;
