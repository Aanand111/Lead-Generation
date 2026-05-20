const vendorDb = require('../models/vendorModel');
const bcrypt = require('bcryptjs');

const getVendors = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const data = await vendorDb.getAllVendors(page, limit, search);

        res.status(200).json({
            success: true,
            data: data.vendors,
            globalStats: data.globalStats,
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

const addVendor = async (req, res, next) => {
    try {
        const vendorData = { ...req.body };
        if (vendorData.email) vendorData.email = vendorData.email.trim().toLowerCase();

        if (!vendorData.name || !vendorData.phone || !vendorData.email) {
            return res.status(400).json({ success: false, message: 'Name, phone and email are required' });
        }

        // Generate unguessable code if not provided
        if (!vendorData.referral_code) {
            vendorData.referral_code = `VND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        }

        const rawPassword = vendorData.password;
        if (vendorData.password) {
            const salt = await bcrypt.genSalt(10);
            vendorData.password = await bcrypt.hash(vendorData.password, salt);
        }

        // 1. Create entry in the users table via the vendor model
        const newVendor = await vendorDb.createVendor({
            ...vendorData,
            role: 'vendor'
        });

        res.status(201).json({
            success: true,
            message: 'Vendor node initialized and authentication protocol established.',
            data: newVendor,
        });
    } catch (error) {
        next(error);
    }
};

const updateVendorStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Active' or 'Inactive'

        const vendor = await vendorDb.updateVendorStatus(id, status);

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Vendor status updated successfully',
            data: vendor,
        });
    } catch (error) {
        next(error);
    }
};

const removeVendor = async (req, res, next) => {
    try {
        const { id } = req.params;

        const vendor = await vendorDb.deleteVendor(id);

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Vendor deleted successfully',
            data: vendor
        });
    } catch (error) {
        next(error);
    }
};

const updateVendor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const vendorData = { ...req.body };

        if (vendorData.password) {
            const salt = await bcrypt.genSalt(10);
            vendorData.password = await bcrypt.hash(vendorData.password, salt);
        }

        // 2. Update vendor table (which now correctly points to users)
        const vendor = await vendorDb.updateVendor(id, vendorData);

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Vendor node updated and authentication protocols synchronized.',
            data: vendor,
        });
    } catch (error) {
        next(error);
    }
};

const getVendorStats = async (req, res, next) => {
    try {
        const { id } = req.params;
        const stats = await vendorDb.getVendorStats(id);

        if (!stats) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getVendors,
    addVendor,
    updateVendorStatus,
    removeVendor,
    updateVendor,
    getVendorStats
};
