const subscriptionsService = require('./subscriptions.service');

class SubscriptionsController {
    async getPlans(req, res, next) {
        try {
            const plans = await subscriptionsService.getAllPlans({
                ...req.query,
                status: req.query.status || 'Active'
            });

            res.status(200).json({
                success: true,
                data: plans.map((plan) => ({
                    ...plan,
                    lead_limit: plan.leads_limit,
                    validity_days: plan.duration
                }))
            });
        } catch (error) {
            next(error);
        }
    }

    async purchasePlan(req, res, next) {
        try {
            const { subscription, plan, creditsToAward } = await subscriptionsService.purchasePlan(req.user.id, req.params.id);
            res.status(200).json({
                success: true,
                message: `Plan ${plan.name} activated. ${creditsToAward} credits added to your wallet.`,
                awardedCredits: creditsToAward,
                data: subscription
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SubscriptionsController();
