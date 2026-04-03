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

        // 1. Create entry in vendors table for Admin Panel specific data
        const newVendor = await vendorDb.createVendor(vendorData);

        // 2. Synchronize with users table for Authentication and Dashboard access
        const { createUser, findUserByEmail, findUserByPhone } = require('../models/userModel');
        const existingByEmail = await findUserByEmail(vendorData.email);
        const existingByPhone = await findUserByPhone(vendorData.phone);
        const existingUser = existingByEmail || existingByPhone;

        if (!existingUser) {
            await createUser({
                phone: vendorData.phone,
                email: vendorData.email,
                password_hash: vendorData.password,
                role: 'vendor',
                referral_code: vendorData.referral_code,
                status: 'ACTIVE',
                full_name: vendorData.name,
                referred_by: vendorData.referred_by_vendor_id || null
            });
            console.log(`[SYNC] User account created for Vendor: ${vendorData.email}`);
        } else {
            // Update existing user to have vendor role and new credentials
            const { pool } = require('../config/db');
            await pool.query(
                `UPDATE users SET 
                    role = 'vendor', 
                    full_name = $1, 
                    password_hash = $2, 
                    referral_code = $3,
                    status = 'ACTIVE',
                    email = $5,
                    phone = $6
                WHERE id = $4`,
                [vendorData.name, vendorData.password, vendorData.referral_code, existingUser.id, vendorData.email, vendorData.phone]
            );
            console.log(`[SYNC] Existing user account upgraded/synchronized for Vendor: ${vendorData.email}`);
        }

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

        const vendor = await vendorDb.updateVendor(id, vendorData);

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        // Synchronize with users table if phone matches
        const { pool } = require('../config/db');
        if (vendor.phone) {
            await pool.query(
                `UPDATE users SET 
                    full_name = COALESCE($1, full_name), 
                    referral_code = COALESCE($2, referral_code),
                    status = COALESCE($3, status),
                    password_hash = COALESCE($5, password_hash)
                WHERE phone = $4`,
                [vendor.name, vendor.referral_code, vendor.status === 'Active' ? 'ACTIVE' : 'BLOCKED', vendor.phone, vendor.password]
            );
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
