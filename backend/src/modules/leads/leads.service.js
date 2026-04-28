const leadsRepository = require('./leads.repository');
const walletService = require('../wallet/wallet.service');
const AppError = require('../../utils/AppError');
const { withTransaction } = require('../../utils/transaction');

class LeadsService {
    async getAvailableLeads(userId, query) {
        const filters = {
            city: query.city,
            state: query.state,
            pincode: query.pincode,
            category: query.category
        };
        const page = Math.max(1, parseInt(query.page) || 1);
        const limit = Math.min(50, parseInt(query.limit) || 20);
        const offset = (page - 1) * limit;

        const { leads, total } = await leadsRepository.getAvailableLeads(userId, filters, { limit, offset });
        const walletBalance = await walletService.getBalance(userId);

        return {
            leads: this._maskLeads(leads),
            walletBalance,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async purchaseLead(userId, leadId) {
        const purchase = await withTransaction(async (client) => {
            // 1. Lock and check lead
            const lead = await leadsRepository.findByIdWithLock(leadId, client);
            if (!lead) throw new AppError('Lead not found.', 404);
            if (lead.status !== 'ACTIVE') throw new AppError('This lead is no longer available.', 400);

            // 2. Check if already purchased
            const exists = await leadsRepository.checkPurchaseExists(userId, leadId, client);
            if (exists) throw new AppError('You have already purchased this lead.', 409);

            // 3. Process Payment via WalletService (Pass client for transaction)
            const cost = 10; // Business rule: fixed cost
            await walletService.debit(userId, cost, `Purchased lead #${leadId}`, leadId, client);

            // 4. Record Purchase
            const purchase = await leadsRepository.recordPurchase({
                user_id: userId,
                lead_id: leadId,
                cost: cost,
                status: 'ACQUIRED',
                lead_value: lead.lead_value
            }, client);

            return purchase;
        });

        walletService.emitBalanceUpdate(userId);
        return purchase;
    }

    _maskLeads(leads) {
        const mask = (str, visible = 2) => {
            if (!str) return '****';
            return str.slice(0, visible) + 'x'.repeat(Math.max(4, str.length - visible));
        };

        return leads.map(r => ({
            id: r.id,
            lead_uid: r.lead_id || `LEAD-${String(r.id).slice(0, 4)}`,
            name: `Mr. ${mask(r.customer_name?.split(' ')[0])} ${mask(r.customer_name?.split(' ')[1])}`,
            contact_hint_1: `${mask(r.customer_email?.split('@')[0], 3)}${r.id.toString().slice(0, 3)}`,
            contact_hint_2: `xxxxxx${r.customer_phone?.slice(-4)}`,
            city: mask(r.city, 3),
            state: mask(r.state, 2),
            category_name: r.category_name,
            credit_cost: r.credit_cost || 10,
            created_at: r.created_at
        }));
    }
}

module.exports = new LeadsService();
