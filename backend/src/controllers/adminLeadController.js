const adminLeadDb = require('../models/leadModel');

const uploadLead = async (req, res, next) => {
    try {
        const { lead_id, customer_name, customer_phone, customer_email, category, city, state, pincode, lead_value, expiry_date } = req.body;
        const adminId = req.user.id;

        if (!customer_phone || !city) {
            return res.status(400).json({ success: false, message: 'Please provide at least customer phone, and city.' });
        }

        const lead = await adminLeadDb.createLead({
            lead_id, customer_name, customer_phone, customer_email, category, city, state, pincode, lead_value,
            expiry_date: expiry_date || new Date(new Date().setDate(new Date().getDate() + 30)) // Default 30 days
        }, adminId);

        res.status(201).json({ success: true, message: 'Lead added successfully', data: lead });
    } catch (error) {
        next(error);
    }
};

const editLead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format. Must be a UUID.' });
        }
        const { lead_id, customer_name, customer_phone, customer_email, category, city, state, pincode, lead_value, expiry_date } = req.body;

        if (!customer_phone || !city) {
            return res.status(400).json({ success: false, message: 'Please provide at least customer phone, and city.' });
        }

        const lead = await adminLeadDb.editLead(id, {
            lead_id, customer_name, customer_phone, customer_email, category, city, state, pincode, lead_value, expiry_date
        });

        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }

        res.status(200).json({ success: true, message: 'Lead updated successfully', data: lead });
    } catch (error) {
        next(error);
    }
};

const getLeads = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const data = await adminLeadDb.getAllLeads(page, limit, search);

        res.status(200).json({
            success: true,
            data: data.leads,
            pagination: {
                total: data.total,
                page,
                limit,
                pages: Math.ceil(data.total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

const removeLead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format. Must be a UUID.' });
        }
        const lead = await adminLeadDb.deleteLead(id);

        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }

        res.status(200).json({ success: true, message: 'Lead marked as deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const getPurchasedLeadsBase = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const data = await adminLeadDb.getPurchasedLeads(page, limit, search);

        res.status(200).json({
            success: true,
            data: data.purchasedLeads,
            pagination: {
                total: data.total,
                page,
                limit,
                pages: Math.ceil(data.total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadLead,
    editLead,
    getLeads,
    removeLead,
    getPurchasedLeads: getPurchasedLeadsBase
};
