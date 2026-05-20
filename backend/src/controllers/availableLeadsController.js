const availableLeadsDb = require('../models/availableLeadsModel');

const getAvailableLeads = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
        const search = typeof req.query.search === 'string' ? req.query.search : '';
        
        const data = await availableLeadsDb.getAvailableLeads(page, limit, search);
        
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

const assignLeads = async (req, res, next) => {
    try {
        const { lead_ids, assignee_type, assignee_id } = req.body;

        if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
            return res.status(400).json({ success: false, message: 'Please select at least one lead to assign.' });
        }
        if (!assignee_type || !assignee_id) {
            return res.status(400).json({ success: false, message: 'Please select a Type and Assignee.' });
        }

        const data = await availableLeadsDb.assignLeads(lead_ids, assignee_type, assignee_id);
        res.status(200).json({ success: true, message: 'Leads assigned successfully!', data });
    } catch (error) {
        next(error);
    }
};

const suggestBestMatch = async (req, res, next) => {
    try {
        const { lead_id } = req.params;
        const matches = await availableLeadsDb.findBestMatchesForLead(lead_id);
        res.status(200).json({ success: true, matches });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAvailableLeads,
    assignLeads,
    suggestBestMatch
};
