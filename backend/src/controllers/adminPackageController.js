const adminPackageDb = require('../models/adminPackageModel');

const addPackage = async (req, res, next) => {
    try {
        const { name, type, category, price, credits, lead_limit, validity_days, description, features, is_active, sort_order } = req.body;

        if (!name || !type || !category || price === undefined) {
            return res.status(400).json({ success: false, message: 'Name, type, category, and price are required' });
        }

        if (!['CREDIT_BASED', 'SUBSCRIPTION'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid package type' });
        }

        const validCategories = ['LEADS', 'POSTER', 'BOTH'];
        const normalizedCategory = category.toUpperCase();

        if (!validCategories.includes(normalizedCategory)) {
            return res.status(400).json({ success: false, message: 'Invalid package category. Must be one of: LEADS, POSTER, BOTH' });
        }

        const newPackage = await adminPackageDb.createPackage({
            name, type, category: normalizedCategory, price, credits, lead_limit, validity_days, description,
            features: features ? JSON.stringify(features) : null,
            is_active: is_active !== undefined ? is_active : true,
            sort_order: sort_order || 0
        });

        res.status(201).json({ success: true, message: 'Package created successfully', data: newPackage });
    } catch (error) {
        next(error);
    }
};

const editPackage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, type, category, price, credits, lead_limit, validity_days, description, features, is_active, sort_order } = req.body;

        if (!['CREDIT_BASED', 'SUBSCRIPTION'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid package type' });
        }

        const validCategories = ['LEADS', 'POSTER', 'BOTH'];
        const normalizedCategory = category.toUpperCase();

        if (!validCategories.includes(normalizedCategory)) {
            return res.status(400).json({ success: false, message: 'Invalid package category. Must be one of: LEADS, POSTER, BOTH' });
        }

        const updatedPackage = await adminPackageDb.updatePackage(id, {
            name, type, category: normalizedCategory, price, credits, lead_limit, validity_days, description,
            features: features ? JSON.stringify(features) : null,
            is_active, sort_order
        });

        if (!updatedPackage) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }

        res.status(200).json({ success: true, message: 'Package updated successfully', data: updatedPackage });
    } catch (error) {
        next(error);
    }
};

const getPackages = async (req, res, next) => {
    try {
        const activeOnly = req.query.activeOnly === 'true';
        const packages = await adminPackageDb.getAllPackages(activeOnly);

        res.status(200).json({ success: true, data: packages });
    } catch (error) {
        next(error);
    }
};

const removePackage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const removed = await adminPackageDb.deletePackage(id);

        if (!removed) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }

        res.status(200).json({ success: true, message: 'Package disabled (soft deleted) successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addPackage,
    editPackage,
    getPackages,
    removePackage
};
