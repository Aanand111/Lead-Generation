const AppError = require('../../utils/AppError');
const { withTransaction } = require('../../utils/transaction');
const walletService = require('../wallet/wallet.service');
const userRepository = require('./user.repository');

class UserService {
    async getDashboardStats(userId) {
        let userData;

        try {
            userData = (await userRepository.getDashboardUserStats(userId)).rows[0];
        } catch (error) {
            if (error.code !== '42P01') {
                throw error;
            }
            userData = (await userRepository.getDashboardUserStatsFallback(userId)).rows[0];
        }

        let referralCode = userData?.referral_code;
        if (!referralCode && userData) {
            referralCode = await this.ensureReferralCode(userId, userData.role);
        }

        const [availableLeadsCount, recentPurchases, recentTransactions] = await Promise.all([
            userRepository.getAvailableLeadCount(userId),
            userRepository.getRecentPurchases(userId),
            userRepository.getRecentTransactions(userId)
        ]);

        const walletBalance = userData?.wallet_balance || 0;
        const totalPurchasedLeads = parseInt(userData?.total_leads || 0, 10);
        const totalReferrals = parseInt(userData?.total_referrals || 0, 10);
        const todaysPosters = parseInt(userData?.todays_posters || 0, 10);

        return {
            creditBalance: walletBalance,
            wallet_balance: walletBalance,
            totalPurchasedLeads,
            availableLeads: availableLeadsCount,
            totalReferrals,
            referralCode: referralCode || 'N/A',
            parentId: userData?.referred_by || 'ORGANIC',
            parentName: userData?.parent_name || (userData?.referred_by ? 'System Node' : 'ORGANIC'),
            parentRole: userData?.parent_role || '',
            parentCode: userData?.parent_code || '',
            isReferral: parseInt(userData?.is_referral || 0, 10) > 0,
            todaysPosters: Math.max(0, 1 - todaysPosters),
            recentPurchases,
            recentTransactions
        };
    }

    async getMyLeads(userId) {
        const leads = await userRepository.getPurchasedLeads(userId);
        return leads.map((lead) => ({
            id: lead.id,
            name: lead.customer_name,
            phone: lead.customer_phone,
            email: lead.customer_email,
            city: lead.city,
            state: lead.state,
            pincode: lead.pincode,
            category: lead.category,
            purchase_date: lead.purchase_date,
            status: lead.purchase_status
        }));
    }

    async getProfile(userId) {
        return userRepository.getProfile(userId);
    }

    async updateProfile(userId, payload) {
        const { name: reqName, full_name, email, address, city, state, pincode } = payload;
        const name = full_name || reqName;

        await withTransaction(async (client) => {
            await userRepository.updateUserIdentity(userId, name, email, client);
            const phone = await userRepository.getUserPhone(userId, client);
            if (phone) {
                await userRepository.syncVendorIdentity(phone, name, email, client);
            }
            await userRepository.upsertProfile(userId, { address, city, state, pincode }, client);
        });
    }

    async getReferralStats(userId) {
        const userDetails = await userRepository.getUserReferralDetails(userId);
        const referralCode = userDetails?.referral_code || await this.ensureReferralCode(userId, userDetails?.role);

        const [referralHistory, totalRewards] = await Promise.all([
            userRepository.getReferralHistory(userId),
            userRepository.getReferralRewardsTotal(userId)
        ]);

        return {
            referralCode: referralCode || 'N/A',
            totalReferrals: referralHistory.length,
            totalRewards,
            referralHistory
        };
    }

    async getNews() {
        return userRepository.getPublishedNews();
    }

    async getBanners() {
        return userRepository.getActiveBanners();
    }

    async getPosters(userId) {
        const [posters, usedToday, hasPosterPackage, subscription] = await Promise.all([
            userRepository.getUserPosters(userId),
            userRepository.countTodayPosters(userId),
            userRepository.hasActivePosterPackage(userId),
            userRepository.getActivePosterSubscription(userId)
        ]);

        const hasPosterPlan = hasPosterPackage || (
            subscription && (
                subscription.total_posters === 0 ||
                subscription.used_posters < subscription.total_posters
            )
        );

        return {
            data: posters,
            freePosterAvailable: usedToday === 0,
            hasPosterPlan: Boolean(hasPosterPlan)
        };
    }

    async getPosterTemplates(categoryId) {
        return userRepository.getPosterTemplates(categoryId);
    }

    async generatePoster(userId, payload, files) {
        return withTransaction(async (client) => {
            await userRepository.lockUser(userId, client);

            const hasPosterPackage = await userRepository.hasActivePosterPackage(userId, client);
            const subscription = await userRepository.getActivePosterSubscription(userId, { forUpdate: true }, client);

            let hasPosterPlan = Boolean(hasPosterPackage);
            let subscriptionId = null;

            if (!hasPosterPlan && subscription) {
                if (subscription.total_posters === 0 || subscription.used_posters < subscription.total_posters) {
                    hasPosterPlan = true;
                    subscriptionId = subscription.id;
                }
            }

            const extraPosterCost = 5;
            let shouldEmitWalletUpdate = false;
            let isPaid = false;

            if (!hasPosterPlan) {
                const usedToday = await userRepository.countTodayPosters(userId, client);
                if (usedToday >= 1) {
                    const balance = await userRepository.getUserWalletBalance(userId, client);
                    if (balance < extraPosterCost) {
                        throw new AppError(
                            `Daily free pass exhausted. Additional posters cost ${extraPosterCost} credits or buy a Poster Subscription.`,
                            403
                        );
                    }

                    await walletService.debit(
                        userId,
                        extraPosterCost,
                        `Premium Poster Render: ${payload.title}`,
                        `poster:${payload.template_id}`,
                        client
                    );

                    shouldEmitWalletUpdate = true;
                    isPaid = true;
                }
            }

            const template = await userRepository.getPosterTemplate(payload.template_id, client);
            if (!template) {
                throw new AppError('Template not found', 404);
            }

            const parsedData = this.parsePosterUserData(payload.user_data, files);
            if (subscriptionId) {
                await userRepository.incrementSubscriptionPosterUsage(subscriptionId, client);
            }

            const poster = await userRepository.createPoster({
                userId,
                title: payload.title,
                thumbnail: template.thumbnail,
                categoryId: template.category_id,
                layoutConfig: JSON.stringify(parsedData),
                status: 'Active',
                durationDays: template.duration_days || 30
            }, client);

            return {
                success: true,
                message: hasPosterPlan
                    ? 'Poster generated! (Unlimited Subscription Active)'
                    : (isPaid ? 'Poster generated (Credits deducted)' : 'Poster generated using free daily pass'),
                data: poster,
                shouldEmitWalletUpdate
            };
        }).then((result) => {
            if (result.shouldEmitWalletUpdate) {
                walletService.emitBalanceUpdate(userId);
            }

            return {
                success: result.success,
                message: result.message,
                data: result.data
            };
        });
    }

    async submitLeadFeedback(userId, payload) {
        const { lead_id: leadId, rating, comment } = payload;
        if (!leadId || !rating) {
            throw new AppError('Lead ID and Rating are required', 400);
        }

        const vendorId = await userRepository.getLeadVendorId(leadId);
        if (!vendorId) {
            throw new AppError('Lead not found', 404);
        }

        return userRepository.createLeadFeedback({
            userId,
            leadId,
            vendorId,
            rating,
            comment
        });
    }

    parsePosterUserData(userData, files) {
        let parsedData = {};
        try {
            parsedData = typeof userData === 'string' ? JSON.parse(userData) : (userData || {});
        } catch (error) {
            parsedData = userData || {};
        }

        if (files?.logo?.[0]) {
            parsedData.logo_url = files.logo[0].path;
        }
        if (files?.image?.[0]) {
            parsedData.visual_url = files.image[0].path;
        }

        return parsedData;
    }

    async ensureReferralCode(userId, role) {
        let referralCode = this.generateReferralCode(role);

        while (await userRepository.referralCodeExists(referralCode)) {
            referralCode = this.generateReferralCode(role);
        }

        await userRepository.updateReferralCode(userId, referralCode);
        return referralCode;
    }

    generateReferralCode(role) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i += 1) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const prefix = role === 'vendor' ? 'VND' : 'USR';
        return `${prefix}-${code}${Date.now().toString(36).slice(-2).toUpperCase()}`;
    }
}

module.exports = new UserService();
