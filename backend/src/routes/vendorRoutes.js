const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { 
    getVendorStats, 
    getVendorReferrals, 
    getVendorEarnings, 
    referUser, 
    referVendor 
} = require('../controllers/vendorPanelController');

const router = express.Router();

// All vendor panel routes are protected
router.use(protect);

// Vendor-specific role check should also be here (though protect handles base auth)
const vendorOrAdmin = (req, res, next) => {
    if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Vendor or Admin access only' });
    }
    next();
};

router.use(vendorOrAdmin);

router.get('/stats', getVendorStats);
router.get('/referrals', getVendorReferrals);
router.get('/earnings', getVendorEarnings);
router.post('/refer-user', referUser);
router.post('/refer-vendor', referVendor);

module.exports = router;
