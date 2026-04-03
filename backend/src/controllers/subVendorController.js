const subVendorDb = require('../models/subVendorModel');
const bcrypt = require('bcryptjs');

const getSubVendors = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const data = await subVendorDb.getAllSubVendors(page, limit, search);

        res.status(200).json({
            success: true,
            data: data.subVendors,
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

const addSubVendor = async (req, res, next) => {
    try {
        const vendorData = { ...req.body };

        if (!vendorData.name || !vendorData.phone || !vendorData.email) {
            return res.status(400).json({ success: false, message: 'Name, phone and email are required' });
        }

        // Generate unguessable code if not provided
        if (!vendorData.referral_code) {
            vendorData.referral_code = `SVND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        }

        const rawPassword = vendorData.password;
        if (vendorData.password) {
            const salt = await bcrypt.genSalt(10);
            vendorData.password = await bcrypt.hash(vendorData.password, salt);
        }

        // 1. Create entry in vendors table for Admin Panel specific data
        const newSubVendor = await subVendorDb.createSubVendor(vendorData);

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
                role: 'vendor', // SubVendors share vendor role but are limited by hierarchy in some views
                referral_code: vendorData.referral_code,
                status: 'ACTIVE',
                full_name: vendorData.name,
                referred_by: vendorData.referred_by_vendor_id || null
            });
            console.log(`[SYNC] User account created for SubVendor: ${vendorData.email}`);
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
            console.log(`[SYNC] Existing user account upgraded/synchronized for SubVendor: ${vendorData.email}`);
        }

        res.status(201).json({ success: true, data: newSubVendor });
    } catch (error) {
        next(error);
    }
};

const updateSubVendor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };
        
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
        }

        const subVendor = await subVendorDb.updateSubVendor(id, data);
        if (!subVendor) {
            return res.status(404).json({ success: false, message: 'SubVendor not found' });
        }
        res.status(200).json({ success: true, data: subVendor });
    } catch (error) {
        next(error);
    }
};

const removeSubVendor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const subVendor = await subVendorDb.deleteSubVendor(id);
        if (!subVendor) {
            return res.status(404).json({ success: false, message: 'SubVendor not found' });
        }
        res.status(200).json({ success: true, data: subVendor });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSubVendors,
    addSubVendor,
    updateSubVendor,
    removeSubVendor
};
