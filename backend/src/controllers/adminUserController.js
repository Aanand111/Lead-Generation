const adminDb = require('../models/adminUserModel');

const getUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const roleFilter = req.query.role || '';

        const data = await adminDb.getAllUsers(page, limit, search, roleFilter);

        res.status(200).json({
            success: true,
            data: data.users,
            pagination: {
                total: data.total,
                page,
                limit,
                pages: Math.ceil(data.total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

const updateVendorCommission = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { commission_rate } = req.body;

        const updated = await adminDb.updateVendorCommission(id, commission_rate);
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Vendor not found or not a vendor' });
        }

        res.status(200).json({
            success: true,
            message: 'Vendor commission rate updated successfully',
            data: updated
        });
    } catch (error) {
        next(error);
    }
}

const blockUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isBlocked } = req.body;

        const user = await adminDb.blockUnblockUser(id, isBlocked);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

const updateWallet = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amount, actionType, remarks } = req.body; // actionType: 'CREDIT', 'DEBIT'

        if (!amount || isNaN(amount)) {
            return res.status(400).json({ success: false, message: 'Valid amount is required' });
        }

        const finalAmount = actionType === 'DEBIT' ? -Math.abs(amount) : Math.abs(amount);

        const user = await adminDb.adjustWalletBalance(id, finalAmount, actionType, remarks || 'Admin Wallet Adjustment');

        res.status(200).json({
            success: true,
            message: 'Wallet balance updated successfully',
            data: user,
        });
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const getReferralTree = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tree = await adminDb.getUserReferralTree(id);

        res.status(200).json({
            success: true,
            data: tree,
            message: 'Referral tree fetched strictly for direct referrals as per BRD'
        });
    } catch (error) {
        next(error);
    }
}

const uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Assuming the 'protect' middleware adds the user object to the request
        if (req.user && req.user.id) {
            // We need a function in our model to update the photo
            await adminDb.updateProfilePhoto(req.user.id, req.file.path);
        }

        // req.file.path contains the secure url returned by cloudinary
        res.status(200).json({
            success: true,
            secure_url: req.file.path
        });
    } catch (error) {
        console.error('Error in uploadProfilePhoto:', error);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name, email } = req.body;

        const updated = await adminDb.updateProfile(userId, { name, email });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updated
        });
    } catch (error) {
        next(error);
    }
};

const fetchCommissions = async (req, res, next) => {
    try {
        const { status } = req.query; // 'PENDING' or 'COMPLETED'
        const commissions = await adminDb.getCommissions(status);

        res.status(200).json({
            success: true,
            data: commissions
        });
    } catch (error) {
        next(error);
    }
};

const handleCommissionApproval = async (req, res, next) => {
    try {
        const { id } = req.params;
        const transaction = await adminDb.approveCommission(id);

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Commission transaction not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Commission approved and cleared for vendor.',
            data: transaction
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUsers,
    blockUser,
    updateWallet,
    getReferralTree,
    uploadProfilePhoto,
    updateProfile,
    updateVendorCommission,
    fetchCommissions,
    handleCommissionApproval
};
