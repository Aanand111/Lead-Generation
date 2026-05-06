const { pool } = require('../../config/db');

class UserRepository {
    async getDashboardUserStats(userId, client = pool) {
        return client.query(`
            SELECT u.wallet_balance, u.referral_code, u.referred_by, u.role,
                   mv.total_leads, mv.total_referrals, mv.todays_posters,
                   CASE
                       WHEN p.full_name IS NOT NULL AND p.full_name != p.phone THEN p.full_name
                       WHEN v.name IS NOT NULL AND v.name != p.phone THEN v.name
                       ELSE COALESCE(p.full_name, v.name, p.phone)
                   END as parent_name,
                   CASE
                       WHEN p.role = 'vendor' AND p.referred_by IS NOT NULL THEN 'SUB-VENDOR'
                       WHEN p.role = 'vendor' THEN 'VENDOR'
                       ELSE p.role
                   END as parent_role,
                   p.referral_code as parent_code,
                   (SELECT COUNT(*) FROM referrals r WHERE r.referred_user_id = u.id) as is_referral
            FROM users u
            LEFT JOIN mv_user_stats mv ON u.id = mv.user_id
            LEFT JOIN users p ON u.referred_by = p.id
            LEFT JOIN vendors v ON p.phone = v.phone
            WHERE u.id = $1
        `, [userId]);
    }

    async getDashboardUserStatsFallback(userId, client = pool) {
        return client.query(`
            SELECT u.wallet_balance, u.referral_code, u.referred_by, u.role,
                   (SELECT COUNT(*) FROM lead_purchases lp WHERE lp.user_id = u.id) as total_leads,
                   (SELECT COUNT(*) FROM referrals r WHERE r.referrer_id = u.id) as total_referrals,
                   (SELECT COUNT(*) FROM posters po WHERE po.user_id = u.id AND po.created_at >= CURRENT_DATE) as todays_posters,
                   CASE
                       WHEN p.full_name IS NOT NULL AND p.full_name != p.phone THEN p.full_name
                       WHEN v.name IS NOT NULL AND v.name != p.phone THEN v.name
                       ELSE COALESCE(p.full_name, v.name, p.phone)
                   END as parent_name,
                   CASE
                       WHEN p.role = 'vendor' AND p.referred_by IS NOT NULL THEN 'SUB-VENDOR'
                       WHEN p.role = 'vendor' THEN 'VENDOR'
                       ELSE p.role
                   END as parent_role,
                   p.referral_code as parent_code,
                   (SELECT COUNT(*) FROM referrals r WHERE r.referred_user_id = u.id) as is_referral
            FROM users u
            LEFT JOIN users p ON u.referred_by = p.id
            LEFT JOIN vendors v ON p.phone = v.phone
            WHERE u.id = $1
        `, [userId]);
    }

    async updateReferralCode(userId, referralCode, client = pool) {
        await client.query('UPDATE users SET referral_code = $1 WHERE id = $2', [referralCode, userId]);
    }

    async getAvailableLeadCount(userId, client = pool) {
        const result = await client.query(
            `SELECT COUNT(*)
             FROM leads l
             LEFT JOIN lead_purchases lp ON lp.lead_id = l.id AND lp.user_id = $1
             WHERE lp.id IS NULL AND l.status = 'ACTIVE'`,
            [userId]
        );
        return parseInt(result.rows[0].count, 10);
    }

    async getRecentPurchases(userId, client = pool) {
        const result = await client.query(`
            SELECT lp.*, l.lead_id as lead_uid, l.customer_name as lead_name, l.category
            FROM lead_purchases lp
            JOIN leads l ON lp.lead_id = l.id
            WHERE lp.user_id = $1
            ORDER BY lp.purchase_date DESC
            LIMIT 5
        `, [userId]);
        return result.rows;
    }

    async getRecentTransactions(userId, client = pool) {
        const result = await client.query(`
            SELECT *
            FROM transactions
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 5
        `, [userId]);
        return result.rows;
    }

    async getPurchasedLeads(userId, client = pool) {
        const result = await client.query(`
            SELECT l.*, lp.purchase_date, lp.status as purchase_status
            FROM leads l
            JOIN lead_purchases lp ON l.id = lp.lead_id
            WHERE lp.user_id = $1
            ORDER BY lp.purchase_date DESC
        `, [userId]);
        return result.rows;
    }

    async getUploadedLeadsWithStats(userId, client = pool) {
        const result = await client.query(`
            SELECT 
                l.id, l.lead_id as lead_uid, l.customer_name, l.category, l.city, l.pincode, l.status, l.created_at,
                (SELECT COUNT(*) FROM lead_purchases lp WHERE lp.lead_id = l.id) as purchase_count,
                (SELECT COUNT(*) FROM lead_feedback lf WHERE lf.lead_id = l.id) as interest_count
            FROM leads l
            WHERE l.created_by = $1
            ORDER BY l.created_at DESC
        `, [userId]);
        return result.rows;
    }

    async getProfile(userId, client = pool) {
        const result = await client.query(`
            SELECT
                u.id, u.phone,
                CASE
                    WHEN u.full_name IS NOT NULL AND u.full_name != u.phone THEN u.full_name
                    WHEN v.name IS NOT NULL AND v.name != u.phone THEN v.name
                    ELSE COALESCE(u.full_name, v.name)
                END as full_name,
                u.email, up.address, up.city, up.state, up.pincode, up.pan_number, up.profile_image as profile_pic,
                u.status, u.referral_code, u.referred_by, p.full_name as parent_name
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            LEFT JOIN vendors v ON u.phone = v.phone
            LEFT JOIN users p ON u.referred_by = p.id
            WHERE u.id = $1
        `, [userId]);
        return result.rows[0];
    }

    async updateUserIdentity(userId, name, email, phone, client = pool) {
        await client.query(
            `UPDATE users
             SET full_name = COALESCE(NULLIF($1, ''), full_name),
                 email = COALESCE(NULLIF($2, ''), email),
                 phone = COALESCE(NULLIF($3, ''), phone)
             WHERE id = $4`,
            [name, email, phone, userId]
        );
    }

    async getUserPhone(userId, client = pool) {
        const result = await client.query('SELECT phone FROM users WHERE id = $1', [userId]);
        return result.rows[0]?.phone || null;
    }

    async syncVendorIdentity(phone, name, email, client = pool) {
        await client.query(
            `UPDATE vendors
             SET name = COALESCE(NULLIF($1, ''), name),
                 email = COALESCE(NULLIF($2, ''), email)
             WHERE phone = $3`,
            [name, email, phone]
        );
    }

    async upsertProfile(userId, profile, client = pool) {
        const { address, city, state, pincode, pan_number, profile_image } = profile;
        await client.query(
            `INSERT INTO user_profiles (user_id, address, city, state, pincode, pan_number, profile_image)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (user_id)
             DO UPDATE SET
                address = COALESCE(EXCLUDED.address, user_profiles.address),
                city = COALESCE(EXCLUDED.city, user_profiles.city),
                state = COALESCE(EXCLUDED.state, user_profiles.state),
                pincode = COALESCE(EXCLUDED.pincode, user_profiles.pincode),
                pan_number = COALESCE(EXCLUDED.pan_number, user_profiles.pan_number),
                profile_image = COALESCE(EXCLUDED.profile_image, user_profiles.profile_image)`,
            [userId, address, city, state, pincode, pan_number, profile_image]
        );
    }

    async getUserReferralDetails(userId, client = pool) {
        const result = await client.query('SELECT referral_code, role FROM users WHERE id = $1', [userId]);
        return result.rows[0];
    }

    async referralCodeExists(referralCode, client = pool) {
        const result = await client.query('SELECT id FROM users WHERE referral_code = $1', [referralCode]);
        return result.rows.length > 0;
    }

    async getReferralHistory(userId, client = pool) {
        const result = await client.query(`
            SELECT u.full_name as name, u.phone, u.status, r.commission_earned as reward, r.created_at
            FROM referrals r
            JOIN users u ON r.referred_user_id = u.id
            WHERE r.referrer_id = $1
            ORDER BY r.created_at DESC
        `, [userId]);
        return result.rows;
    }

    async getReferralRewardsTotal(userId, client = pool) {
        const result = await client.query(
            'SELECT SUM(commission_earned) as total FROM referrals WHERE referrer_id = $1',
            [userId]
        );
        return parseFloat(result.rows[0]?.total || 0);
    }

    async getPublishedNews(client = pool) {
        const result = await client.query(`
            SELECT n.*, c.name as category_name
            FROM news n
            LEFT JOIN news_categories c ON n.category_id = c.id
            WHERE n.status = true
            ORDER BY n.created_at DESC
        `);
        return result.rows;
    }

    async getActiveBanners(client = pool) {
        const result = await client.query(
            'SELECT * FROM banners WHERE is_active = true ORDER BY created_at DESC'
        );
        return result.rows;
    }

    async getUserPosters(userId, client = pool) {
        const result = await client.query(
            'SELECT * FROM posters WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return result.rows;
    }

    async countTodayPosters(userId, client = pool) {
        const result = await client.query(
            'SELECT COUNT(*) FROM posters WHERE user_id = $1 AND created_at >= CURRENT_DATE',
            [userId]
        );
        return parseInt(result.rows[0].count, 10);
    }

    async hasActivePosterPackage(userId, client = pool) {
        const result = await client.query(
            `SELECT up.id
             FROM user_packages up
             JOIN packages p ON up.package_id = p.id
             WHERE up.user_id = $1
             AND p.category IN ('POSTER', 'BOTH')
             AND up.status = 'ACTIVE'
             AND up.expiry_date >= NOW()
             LIMIT 1`,
            [userId]
        );
        return result.rows.length > 0;
    }

    async getActivePosterSubscription(userId, { forUpdate = false } = {}, client = pool) {
        const result = await client.query(
            `SELECT s.id, s.total_posters, s.used_posters
             FROM subscriptions s
             JOIN subscription_plans p ON s.plan_id = p.id
             WHERE s.user_id = $1
             AND p.category IN ('POSTER', 'BOTH')
             AND s.status = 'Active'
             AND s.end_date >= CURRENT_DATE
             ORDER BY s.end_date DESC
             LIMIT 1
             ${forUpdate ? 'FOR UPDATE OF s' : ''}`,
            [userId]
        );
        return result.rows[0];
    }

    async getPosterTemplates(categoryId, client = pool) {
        const params = ['Published'];
        let query = `
            SELECT p.*, c.name as category_name
            FROM posters p
            LEFT JOIN poster_categories c ON p.category_id = c.id
            WHERE p.user_id IS NULL AND p.status = $1
        `;

        if (categoryId) {
            params.push(categoryId);
            query += ` AND p.category_id = $${params.length}`;
        }

        const result = await client.query(query, params);
        return result.rows;
    }

    async lockUser(userId, client) {
        await client.query('SELECT id FROM users WHERE id = $1 FOR UPDATE', [userId]);
    }

    async getUserWalletBalance(userId, client = pool) {
        const result = await client.query('SELECT wallet_balance FROM users WHERE id = $1', [userId]);
        return parseFloat(result.rows[0]?.wallet_balance || 0);
    }

    async getPosterTemplate(templateId, client = pool) {
        const result = await client.query('SELECT * FROM posters WHERE id = $1', [templateId]);
        return result.rows[0];
    }

    async incrementSubscriptionPosterUsage(subscriptionId, client = pool) {
        await client.query(
            'UPDATE subscriptions SET used_posters = used_posters + 1 WHERE id = $1',
            [subscriptionId]
        );
    }

    async createPoster(data, client = pool) {
        const { userId, title, thumbnail, categoryId, layoutConfig, status, durationDays } = data;
        const result = await client.query(
            `INSERT INTO posters (user_id, title, thumbnail, category_id, layout_config, status, expiry_date, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW() + ($7 || ' days')::INTERVAL, NOW(), NOW())
             RETURNING *`,
            [userId, title, thumbnail, categoryId, layoutConfig, status, durationDays]
        );
        return result.rows[0];
    }

    async getLeadVendorId(leadId, client = pool) {
        const result = await client.query('SELECT created_by as vendor_id FROM leads WHERE id = $1', [leadId]);
        return result.rows[0]?.vendor_id || null;
    }

    async createLeadFeedback(data, client = pool) {
        const { userId, leadId, vendorId, rating, comment } = data;
        const result = await client.query(
            `INSERT INTO lead_feedback (user_id, lead_id, vendor_id, rating, comment)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [userId, leadId, vendorId, rating, comment]
        );
        return result.rows[0];
    }
}

module.exports = new UserRepository();
