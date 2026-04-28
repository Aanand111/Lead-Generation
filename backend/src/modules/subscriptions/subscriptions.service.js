const subscriptionsRepository = require('./subscriptions.repository');
const walletRepository = require('../wallet/wallet.repository');
const walletService = require('../wallet/wallet.service');
const AppError = require('../../utils/AppError');
const { withTransaction } = require('../../utils/transaction');
const { processCommission } = require('../../services/commissionService');

class SubscriptionsService {
    async getAllPlans(filters) {
        return await subscriptionsRepository.findAllPlans(filters);
    }

    async purchasePlan(userId, planId) {
        const result = await withTransaction(async (client) => {
            const plan = await subscriptionsRepository.findPlanById(planId, client);
            if (!plan) throw new AppError('Subscription plan not found.', 404);
            if (plan.status !== 'Active') throw new AppError('This plan is currently not available.', 400);

            const creditsToAward = parseInt(plan.credits || 0, 10);

            if (creditsToAward > 0) {
                await walletRepository.creditBalance(userId, creditsToAward, client);
            }

            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + (plan.duration || 30));

            const subscription = await subscriptionsRepository.createSubscription({
                user_id: userId,
                plan_id: planId,
                total_leads: plan.leads_limit || 0,
                total_posters: plan.poster_limit || 0,
                start_date: startDate,
                end_date: endDate,
                status: 'Active'
            }, client);

            await walletRepository.createTransaction({
                user_id: userId,
                type: 'PLAN_PURCHASE',
                amount: plan.price || 0,
                credits: creditsToAward,
                status: 'COMPLETED',
                remarks: `Activated Plan: ${plan.name}`,
                reference_id: subscription.id
            }, client);

            return { subscription, plan, creditsToAward };
        });

        if ((result.plan.price || 0) > 0) {
            await processCommission(
                userId,
                parseFloat(result.plan.price),
                `Package Purchase: ${result.plan.name} (Direct Activation)`
            );
        }

        walletService.emitBalanceUpdate(userId);
        return result;
    }

    async getActiveSubscription(userId, category) {
        return await subscriptionsRepository.findActiveSubscription(userId, category);
    }
}

module.exports = new SubscriptionsService();
