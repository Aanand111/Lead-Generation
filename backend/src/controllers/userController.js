const { pool } = require('../config/db');
const { buildLeadPurchaseInsert, loadLeadPurchaseColumns } = require('../utils/leadPurchaseSchema');

// --- Dashboard Stats ---
const getDashboardStats = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get User details (Referral Code and Parent ID)
        let userRes = await pool.query(`
            SELECT u.wallet_balance, u.referral_code, u.referred_by, 
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
        let userData = userRes.rows[0];
        
        let referralCode = userData?.referral_code;
        if (!referralCode && userData) {
            const prefix = userData.role === 'vendor' ? 'VND' : 'USR';
            referralCode = `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            await pool.query('UPDATE users SET referral_code = $1 WHERE id = $2', [referralCode, userId]);
        }

        const walletBalance = userData?.wallet_balance || 0;
        referralCode = referralCode || 'N/A';
        const parentId = userData?.referred_by || 'ORGANIC';
        const parentName = userData?.parent_name || (userData?.referred_by ? 'System Node' : 'ORGANIC');
        const parentRole = userData?.parent_role || '';
        const parentCode = userData?.parent_code || '';
        const isReferral = parseInt(userData?.is_referral || 0) > 0;

        // Get Total Purchased Leads
        const leadsRes = await pool.query('SELECT COUNT(*) FROM lead_purchases WHERE user_id = $1', [userId]);
        const totalPurchasedLeads = parseInt(leadsRes.rows[0].count);

        // Get Total Referrals
        const referralsRes = await pool.query('SELECT COUNT(*) FROM referrals WHERE referrer_id = $1', [userId]);
        const totalReferrals = parseInt(referralsRes.rows[0].count);

        // Get Poster Count for today (simplified)
        const posterRes = await pool.query(
            "SELECT COUNT(*) FROM posters WHERE user_id = $1 AND created_at >= CURRENT_DATE", 
            [userId]
        );
        const todaysPosters = parseInt(posterRes.rows[0].count);

        // Get Available Leads Count
        const availLeadsRes = await pool.query(
            "SELECT COUNT(*) FROM leads WHERE id NOT IN (SELECT lead_id FROM lead_purchases WHERE user_id = $1)",
            [userId]
        );
        const availableLeadsCount = parseInt(availLeadsRes.rows[0].count);

        // Get Recent Lead Purchases (Acquisitions)
        const recentPurchasesRes = await pool.query(`
            SELECT lp.*, l.lead_id as lead_uid, l.customer_name as lead_name, l.category
            FROM lead_purchases lp
            JOIN leads l ON lp.lead_id = l.id
            WHERE lp.user_id = $1
            ORDER BY lp.purchase_date DESC
            LIMIT 5
        `, [userId]);

        // Get Recent Transactions (Financial Stream)
        const recentTransactionsRes = await pool.query(`
            SELECT * FROM transactions 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT 5
        `, [userId]);

        res.status(200).json({
            success: true,
            data: {
                creditBalance: walletBalance,
                wallet_balance: walletBalance,
                totalPurchasedLeads,
                availableLeads: availableLeadsCount,
                totalReferrals,
                referralCode,
                parentId,
                parentName,
                parentRole,
                parentCode,
                isReferral,
                todaysPosters: 1 - todaysPosters > 0 ? 1 - todaysPosters : 0, 
                recentPurchases: recentPurchasesRes.rows,
                recentTransactions: recentTransactionsRes.rows 
            }
        });
    } catch (error) {
        require('fs').appendFileSync('crash_log.txt', new Date().toISOString() + ' - Dashboard: ' + error.stack + '\n');
        console.error('[CRASH] getDashboardStats:', error);
        next(error);
    }
};

// --- Available Leads (for User to browse) ---
const getAvailableLeads = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { city, state, pincode, category } = req.query;

        // Filter out leads already purchased by this user
        let query = `
            SELECT l.*, l.category as category_name, 10 as credit_cost 
            FROM leads l
            WHERE l.id NOT IN (SELECT lead_id FROM lead_purchases WHERE user_id = $1)
            AND l.status = 'ACTIVE'
        `;
        const values = [userId];

        if (city) {
            values.push(`%${city}%`);
            query += ` AND l.city ILIKE $${values.length}`;
        }
        if (state) {
            values.push(`%${state}%`);
            query += ` AND l.state ILIKE $${values.length}`;
        }
        if (pincode) {
            values.push(pincode);
            query += ` AND l.pincode = $${values.length}`;
        }
        if (category) {
            values.push(`%${category}%`);
            query += ` AND l.category ILIKE $${values.length}`;
        }

        const result = await pool.query(query, values);

        // Also get user credits for the frontend
        const userRes = await pool.query('SELECT wallet_balance FROM users WHERE id = $1', [userId]);

        res.status(200).json({
            success: true,
            data: result.rows.map(r => {
                // Masking Logic
                const mask = (str, visible = 2) => {
                    if (!str) return '****';
                    return str.slice(0, visible) + 'x'.repeat(Math.max(4, str.length - visible));
                };

                return {
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
                };
            }),
            userCredits: userRes.rows[0]?.wallet_balance || 0
        });
    } catch (error) {
        require('fs').appendFileSync('crash_log.txt', new Date().toISOString() + ' - AvailableLeads: ' + error.stack + '\n');
        console.error('[CRASH] getAvailableLeads:', error);
        next(error);
    }
};

// --- Purchase Lead ---
const purchaseLead = async (req, res, next) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const userId = req.user.id;
        const { id: leadId } = req.params;

        // 1. Get lead details for price and metadata
        const leadCheck = await client.query('SELECT lead_value FROM leads WHERE id = $1', [leadId]);
        if (leadCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Lead not found.' });
        }
        const leadPriceValue = leadCheck.rows[0].lead_value || 0;
        const cost = 10; // Fixed credit cost

        // 2. Check user balance
        const userRes = await client.query('SELECT wallet_balance FROM users WHERE id = $1 FOR UPDATE', [userId]);
        const balance = parseFloat(userRes.rows[0].wallet_balance);

        if (balance < cost) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Insufficient credits.' });
        }

        // 3. Deduct balance
        await client.query('UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2', [cost, userId]);

        // Keep inserts compatible with the live lead_purchases schema, which has drifted across environments.
        const leadPurchaseColumns = await loadLeadPurchaseColumns(client);
        const leadPurchaseInsert = buildLeadPurchaseInsert(leadPurchaseColumns, leadPriceValue);
        const insertParams = [userId, leadId, cost, 'ACQUIRED', ...leadPurchaseInsert.values];
        const placeholders = insertParams.map((_, index) => `$${index + 1}`).join(', ');

        await client.query(
            `INSERT INTO lead_purchases (${leadPurchaseInsert.insertColumns.join(', ')}) 
             VALUES (${placeholders})`,
            insertParams
        );

        // 5. Create transaction log
        await client.query(
            'INSERT INTO transactions (user_id, type, amount, credits, status, remarks) VALUES ($1, $2, $3, $4, $5, $6)',
            [userId, 'PURCHASE', 0, cost, 'COMPLETED', `Purchased lead ${leadId}`]
        );

        await client.query('COMMIT');

        // Real-time Wallet Refresh
        try {
            const { sendToUser } = require('../utils/socket');
            const updatedUser = await pool.query('SELECT wallet_balance FROM users WHERE id = $1', [userId]);
            sendToUser(userId, 'wallet_update', { wallet_balance: updatedUser.rows[0].wallet_balance });
        } catch (sErr) {
            console.error('[SOCKET ERROR] Failed to send balance update:', sErr.message);
        }

        res.status(200).json({ success: true, message: 'Lead purchased successfully.' });
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
};

// --- My Leads ---
const getMyLeads = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT l.*, lp.purchase_date, lp.status as purchase_status
            FROM leads l
            JOIN lead_purchases lp ON l.id = lp.lead_id
            WHERE lp.user_id = $1
            ORDER BY lp.purchase_date DESC
        `;
        const result = await pool.query(query, [userId]);

        res.status(200).json({
            success: true,
            data: result.rows.map(r => ({
                id: r.id,
                name: r.customer_name,
                phone: r.customer_phone,
                email: r.customer_email,
                city: r.city,
                state: r.state,
                pincode: r.pincode,
                category: r.category,
                purchase_date: r.purchase_date,
                status: r.purchase_status
            }))
        });
    } catch (error) {
        next(error);
    }
};

// --- Profile ---
const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(`
            SELECT 
                u.id, u.phone, 
                CASE 
                    WHEN u.full_name IS NOT NULL AND u.full_name != u.phone THEN u.full_name 
                    WHEN v.name IS NOT NULL AND v.name != u.phone THEN v.name 
                    ELSE COALESCE(u.full_name, v.name) 
                END as full_name,
                u.email, up.address, up.city, up.state, up.pincode, up.profile_image as profile_pic,
                u.status, u.referral_code, u.referred_by, p.full_name as parent_name
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            LEFT JOIN vendors v ON u.phone = v.phone
            LEFT JOIN users p ON u.referred_by = p.id
            WHERE u.id = $1
        `, [userId]);

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name: reqName, full_name, email, address, city, state, pincode } = req.body;
        const name = full_name || reqName;

        // Update name and email in users table safely
        await pool.query(
            'UPDATE users SET full_name = COALESCE(NULLIF($1, \'\'), full_name), email = COALESCE(NULLIF($2, \'\'), email) WHERE id = $3',
            [name, email, userId]
        );

        // Synchronize with vendors table to keep data universal
        const userRes = await pool.query('SELECT phone FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length > 0) {
            const userPhone = userRes.rows[0].phone;
            await pool.query(
                'UPDATE vendors SET name = COALESCE(NULLIF($1, \'\'), name), email = COALESCE(NULLIF($2, \'\'), email) WHERE phone = $3',
                [name, email, userPhone]
            );
        }

        // Upsert profile in user_profiles
        const profileCheck = await pool.query('SELECT id FROM user_profiles WHERE user_id = $1', [userId]);
        if (profileCheck.rows.length > 0) {
            await pool.query(
                'UPDATE user_profiles SET address = $1, city = $2, state = $3, pincode = $4 WHERE user_id = $5',
                [address, city, state, pincode, userId]
            );
        } else {
            await pool.query(
                'INSERT INTO user_profiles (user_id, address, city, state, pincode) VALUES ($1, $2, $3, $4, $5)',
                [userId, address, city, state, pincode]
            );
        }

        res.status(200).json({ success: true, message: 'Profile updated successfully.' });
    } catch (error) {
        next(error);
    }
};

// --- Subscription Plans ---
const getSubscriptionPlans = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM subscription_plans WHERE status = $1 ORDER BY created_at DESC', ['Active']);
        res.status(200).json({
            success: true,
            data: result.rows.map(r => ({
                ...r,
                lead_limit: r.leads_limit, // for frontend compatibility
                validity_days: r.duration  // for frontend compatibility
            }))
        });
    } catch (error) {
        next(error);
    }
};

// --- Referrals ---
const getReferralStats = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRes = await pool.query('SELECT referral_code, role FROM users WHERE id = $1', [userId]);
        let referralCode = userRes.rows[0]?.referral_code;

        if (!referralCode) {
            const generateSafeCode = () => {
                const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                let code = '';
                for (let i = 0; i < 6; i++) {
                    code += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                const prefix = userRes.rows[0]?.role === 'vendor' ? 'VND' : 'USR';
                return `${prefix}-${code}${Date.now().toString(36).slice(-2).toUpperCase()}`;
            };

            referralCode = generateSafeCode();
            
            // Uniqueness check for existing users update
            let isCollision = await pool.query('SELECT id FROM users WHERE referral_code = $1', [referralCode]);
            while (isCollision.rows.length > 0) {
                referralCode = generateSafeCode();
                isCollision = await pool.query('SELECT id FROM users WHERE referral_code = $1', [referralCode]);
            }
            
            await pool.query('UPDATE users SET referral_code = $1 WHERE id = $2', [referralCode, userId]);
        }
        
        const referralsRes = await pool.query(`
            SELECT u.full_name as name, u.phone, u.status, r.commission_earned as reward, r.created_at
            FROM referrals r
            JOIN users u ON r.referred_user_id = u.id
            WHERE r.referrer_id = $1
            ORDER BY r.created_at DESC
        `, [userId]);

        const rewardsRes = await pool.query('SELECT SUM(commission_earned) as total FROM referrals WHERE referrer_id = $1', [userId]);

        res.status(200).json({
            success: true,
            data: {
                referralCode: referralCode || 'N/A',
                totalReferrals: referralsRes.rows.length,
                totalRewards: parseFloat(rewardsRes.rows[0]?.total || 0),
                referralHistory: referralsRes.rows
            }
        });
    } catch (error) {
        next(error);
    }
};

// --- News & Banners ---
const getNews = async (req, res, next) => {
    try {
        const result = await pool.query(`
            SELECT n.*, c.name as category_name 
            FROM news n 
            LEFT JOIN news_categories c ON n.category_id = c.id 
            WHERE n.status = true OR n.status = 'Publish'
            ORDER BY n.created_at DESC
        `);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
};

const getBanners = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM banners WHERE is_active = true ORDER BY created_at DESC');
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
};

const getPosters = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await pool.query('SELECT * FROM posters WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        const query = 'SELECT * FROM posters WHERE user_id = $1 ORDER BY created_at DESC';
        
        const freePosterRes = await pool.query(
            "SELECT COUNT(*) FROM posters WHERE user_id = $1 AND created_at >= CURRENT_DATE", 
            [userId]
        );
        const usedToday = parseInt(freePosterRes.rows[0].count);
        const postersRes = await pool.query(query, [userId]);

        // Check for Active Poster-Specific Subscription (Both user_packages and subscriptions)
        const subRes = await pool.query(
            `SELECT up.id FROM user_packages up 
             JOIN packages p ON up.package_id = p.id 
             WHERE up.user_id = $1 AND p.category IN ('POSTER', 'BOTH') 
             AND up.status = 'ACTIVE' AND up.expiry_date >= NOW() LIMIT 1`,
            [userId]
        );

        const subPlanRes = await pool.query(
            `SELECT s.id FROM subscriptions s 
             JOIN subscription_plans p ON s.plan_id = p.id 
             WHERE s.user_id = $1 AND p.category IN ('POSTER', 'BOTH') 
             AND s.status = 'Active' AND s.end_date >= CURRENT_DATE 
             AND (s.total_posters = 0 OR s.used_posters < s.total_posters) LIMIT 1`,
            [userId]
        );

        res.status(200).json({ 
            success: true, 
            data: postersRes.rows,
            freePosterAvailable: usedToday === 0,
            hasPosterPlan: subRes.rows.length > 0 || subPlanRes.rows.length > 0
        });
    } catch (error) {
        next(error);
    }
};

const getPosterTemplates = async (req, res, next) => {
    try {
        const { category_id } = req.query;
        let query = 'SELECT p.*, c.name as category_name FROM posters p LEFT JOIN poster_categories c ON p.category_id = c.id WHERE p.user_id IS NULL AND p.status = $1';
        const params = ['Published'];
        
        if (category_id) {
            query += ' AND p.category_id = $2';
            params.push(category_id);
        }
        
        const result = await pool.query(query, params);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
};

const generatePoster = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { template_id, title, content, user_data } = req.body;

        // 1. Check for Active Poster-Specific Subscription (Unlimited OR Limited Access)
        const subRes = await pool.query(
            `SELECT up.id FROM user_packages up 
             JOIN packages p ON up.package_id = p.id 
             WHERE up.user_id = $1 AND p.category IN ('POSTER', 'BOTH') 
             AND up.status = 'ACTIVE' AND up.expiry_date >= NOW() LIMIT 1`,
            [userId]
        );

        const subPlanRes = await pool.query(
            `SELECT s.id, s.total_posters, s.used_posters FROM subscriptions s 
             JOIN subscription_plans p ON s.plan_id = p.id 
             WHERE s.user_id = $1 AND p.category IN ('POSTER', 'BOTH') 
             AND s.status = 'Active' AND s.end_date >= CURRENT_DATE LIMIT 1`,
            [userId]
        );

        let hasPosterPlan = false;
        let subscriptionId = null;

        if (subRes.rows.length > 0) {
            hasPosterPlan = true;
        } else if (subPlanRes.rows.length > 0) {
            // Check quota if total_posters > 0 (0 means unlimited in this system's context)
            if (subPlanRes.rows[0].total_posters === 0 || subPlanRes.rows[0].used_posters < subPlanRes.rows[0].total_posters) {
                hasPosterPlan = true;
                subscriptionId = subPlanRes.rows[0].id;
            }
        }

        let isPaid = false;
        const extraPosterCost = 5;

        // 2. Check daily limit (If NO subscription, apply the 1-free rule)
        if (!hasPosterPlan) {
            const checkRes = await pool.query(
                "SELECT COUNT(*) FROM posters WHERE user_id = $1 AND created_at >= CURRENT_DATE", 
                [userId]
            );
            const usedToday = parseInt(checkRes.rows[0].count);

            if (usedToday >= 1) {
                // Check if user has enough credits for an extra poster
                const userRes = await pool.query('SELECT wallet_balance FROM users WHERE id = $1', [userId]);
                const balance = parseFloat(userRes.rows[0].wallet_balance || 0);

                if (balance < extraPosterCost) {
                    return res.status(403).json({ 
                        success: false, 
                        message: `Daily free pass exhausted. Additional posters cost ${extraPosterCost} credits or buy a Poster Subscription.` 
                    });
                }
                isPaid = true;
            }
        }

        // Fetch template to get thumbnail/image and duration
        const templateRes = await pool.query('SELECT * FROM posters WHERE id = $1', [template_id]);
        if (templateRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Template not found' });
        
        const template = templateRes.rows[0];
        const durationDays = template.duration_days || 30;

        // Process File Uploads (Logo & Custom Visual)
        let parsedData = {};
        try {
            parsedData = typeof user_data === 'string' ? JSON.parse(user_data) : user_data;
        } catch (e) {
            parsedData = user_data || {};
        }

        if (req.files) {
            if (req.files.logo && req.files.logo[0]) parsedData.logo_url = req.files.logo[0].path;
            if (req.files.image && req.files.image[0]) parsedData.visual_url = req.files.image[0].path;
        }

        // If used subscription quota, increment usage
        if (subscriptionId) {
            await pool.query('UPDATE subscriptions SET used_posters = used_posters + 1 WHERE id = $1', [subscriptionId]);
        }

        // If paid, deduct credits
        if (isPaid) {
            await pool.query('UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2', [extraPosterCost, userId]);
            await pool.query(
                `INSERT INTO transactions (user_id, type, amount, credits, status, remarks) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [userId, 'PURCHASE', 0, extraPosterCost, 'COMPLETED', `Premium Poster Render: ${title}`]
            );

            // Real-time Wallet Refresh
            try {
                const { sendToUser } = require('../utils/socket');
                const updatedUser = await pool.query('SELECT wallet_balance FROM users WHERE id = $1', [userId]);
                sendToUser(userId, 'wallet_update', { wallet_balance: updatedUser.rows[0].wallet_balance });
            } catch (sErr) {
                console.error('[SOCKET ERROR] Failed to send balance update:', sErr.message);
            }
        }

        // Store generated poster (referencing template layout) with expiry_date
        const result = await pool.query(
            `INSERT INTO posters (user_id, title, thumbnail, category_id, layout_config, status, expiry_date, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, NOW() + ($7 || ' days')::INTERVAL, NOW(), NOW()) RETURNING *`,
            [userId, title, template.thumbnail, template.category_id, JSON.stringify(parsedData), 'Active', durationDays]
        );

        res.status(201).json({ 
            success: true, 
            message: hasPosterPlan ? 'Poster generated! (Unlimited Subscription Active)' : (isPaid ? 'Poster generated (Credits deducted)' : 'Poster generated using free daily pass'), 
            data: result.rows[0] 
        });
    } catch (error) {
        next(error);
    }
};

const purchaseSubscriptionPlan = async (req, res, next) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const userId = req.user.id;
        const { id: planId } = req.params;

        // 1. Get Plan Details
        const planRes = await client.query('SELECT * FROM subscription_plans WHERE id = $1 AND status = $2', [planId, 'Active']);
        if (!planRes.rows[0]) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Plan not found or inactive.' });
        }
        const plan = planRes.rows[0];

        // 2. Award Credits (Wallet Balance)
        const creditsToAward = parseInt(plan.credits || 0);
        await client.query('UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2', [creditsToAward, userId]);

        // 3. Log Subscription Purchase
        const durationStr = plan.duration + ' days';
        await client.query(
            `INSERT INTO subscriptions (user_id, plan_id, total_leads, total_posters, status, start_date, end_date) 
             VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_DATE + $6::INTERVAL)`,
            [userId, planId, plan.leads_limit, plan.poster_limit, 'Active', durationStr]
        );

        // 4. Log Transaction
        await client.query(
            'INSERT INTO transactions (user_id, type, amount, credits, status, remarks) VALUES ($1, $2, $3, $4, $5, $6)',
            [userId, 'PLAN_PURCHASE', plan.price, creditsToAward, 'COMPLETED', `Activated Plan: ${plan.name}`]
        );

        // 5. Handle Referrer Commission (Unified via commissionService)
        try {
            if (plan.price > 0) {
                const { processCommission } = require('../services/commissionService');
                await processCommission(userId, parseFloat(plan.price), `Package Purchase: ${plan.name} (Direct Activation)`);
            }
        } catch (commErr) {
            console.error('[COMMISSION ERROR] Failed to process during direct activation:', commErr.message);
        }

        await client.query('COMMIT');

        // Real-time Wallet Refresh
        try {
            const { sendToUser } = require('../utils/socket');
            const updatedUser = await pool.query('SELECT wallet_balance FROM users WHERE id = $1', [userId]);
            sendToUser(userId, 'wallet_update', { wallet_balance: updatedUser.rows[0].wallet_balance });

            // Also notify referrer if commission was awarded
            if (referrerId) {
                const updatedReferrer = await pool.query('SELECT wallet_balance FROM users WHERE id = $1', [referrerId]);
                sendToUser(referrerId, 'wallet_update', { wallet_balance: updatedReferrer.rows[0].wallet_balance });
            }
        } catch (sErr) {
            console.error('[SOCKET ERROR] Failed to send balance update:', sErr.message);
        }

        res.status(200).json({ 
            success: true, 
            message: `Plan ${plan.name} activated. ${creditsToAward} credits added to your wallet.`,
            awardedCredits: creditsToAward
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[CRASH] purchaseSubscriptionPlan:', error);
        next(error);
    } finally {
        client.release();
    }
};

const submitLeadFeedback = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { lead_id, rating, comment } = req.body;
        
        if (!lead_id || !rating) return res.status(400).json({ success: false, message: 'Lead ID and Rating are required' });
        
        // Find vendor_id from lead data
        const leadRes = await pool.query('SELECT created_by as vendor_id FROM leads WHERE id = $1', [lead_id]);
        if (leadRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Lead not found' });
        
        const vendorId = leadRes.rows[0].vendor_id;
        
        const result = await pool.query(
            'INSERT INTO lead_feedback (user_id, lead_id, vendor_id, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, lead_id, vendorId, rating, comment]
        );
        
        res.status(201).json({ success: true, message: 'Feedback submitted successfully', data: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getAvailableLeads,
    purchaseLead,
    purchaseSubscriptionPlan,
    getMyLeads,
    getProfile,
    updateProfile,
    getSubscriptionPlans,
    getReferralStats,
    getNews,
    getBanners,
    getPosters,
    getPosterTemplates,
    generatePoster,
    submitLeadFeedback
};
