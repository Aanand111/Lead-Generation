const leadsService = require('./leads.service');

class LeadsController {
    async getAvailableLeads(req, res, next) {
        try {
            const data = await leadsService.getAvailableLeads(req.user.id, req.query);
            res.status(200).json({
                success: true,
                data: data.leads,
                leads: data.leads,
                userCredits: data.walletBalance,
                walletBalance: data.walletBalance,
                pagination: data.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    async purchaseLead(req, res, next) {
        try {
            const purchase = await leadsService.purchaseLead(req.user.id, req.params.id);
            res.status(200).json({
                success: true,
                message: 'Lead purchased successfully.',
                data: purchase
            });
        } catch (error) {
            next(error);
        }
    }

    async submitLead(req, res, next) {
        try {
            const lead = await leadsService.submitLead(req.user.id, req.body);
            res.status(201).json({
                success: true,
                message: 'Lead submitted successfully! Our team will contact you soon.',
                data: lead
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new LeadsController();
