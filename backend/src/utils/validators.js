const Joi = require('joi');

const idSchema = Joi.alternatives().try(Joi.string().uuid(), Joi.number(), Joi.string());

const vendorSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': 'Phone number must be exactly 10 digits'
    }),
    password: Joi.string().min(6).optional().allow(''),
    status: Joi.string().valid('Active', 'Inactive').optional(),
    referral_code: Joi.string().optional().allow(''),
    referred_by_vendor_id: idSchema.optional().allow(null, ''),
    gender: Joi.string().optional().allow('', null)
}).unknown(true);

const subVendorSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': 'Phone number must be exactly 10 digits'
    }),
    password: Joi.string().min(6).optional().allow(''),
    status: Joi.string().valid('Active', 'Inactive').optional(),
    referral_code: Joi.string().optional().allow(''),
    referred_by_vendor_id: idSchema.required(),
    gender: Joi.string().optional().allow('', null)
}).unknown(true);

const leadSchema = Joi.object({
    lead_id: Joi.string().optional().allow('', null),
    customer_name: Joi.string().min(2).required(),
    customer_phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    customer_email: Joi.string().email().optional().allow('', null),
    category: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().optional().allow('', null),
    pincode: Joi.string().optional().allow('', null),
    lead_value: Joi.number().precision(2).min(0).optional().allow(null, 0, ''),
    expiry_date: Joi.date().iso().optional().allow(null, '')
}).unknown(true);

const customerSchema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().optional().allow('', null),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': 'Phone number must be exactly 10 digits'
    }),
    whatsapp: Joi.string().pattern(/^[0-9]{10}$/).optional().allow('', null).messages({
        'string.pattern.base': 'WhatsApp number must be exactly 10 digits'
    }),
    referral: Joi.string().optional().allow('', null),
    state: Joi.string().optional().allow('', null),
    city: Joi.string().optional().allow('', null),
    pincode: Joi.string().optional().allow('', null),
    designation: Joi.string().optional().allow('', null),
    domain: Joi.string().optional().allow('', null),
    company: Joi.string().optional().allow('', null),
    other_company: Joi.string().optional().allow('', null),
    profile_pic: Joi.string().optional().allow('', null),
    status: Joi.string().valid('Active', 'Inactive').optional()
}).unknown(true);

const categorySchema = Joi.object({
    name: Joi.string().min(2).required(),
    status: Joi.alternatives().try(
        Joi.string().valid('Active', 'Inactive', 'true', 'false'),
        Joi.boolean()
    ).optional()
}).unknown(true);

const bannerSchema = Joi.object({
    title: Joi.string().required(),
    image: Joi.string().required(),
    link: Joi.string().uri().optional().allow(''),
    type: Joi.string().optional().allow(''),
    placement: Joi.string().optional().allow(''),
    start_date: Joi.date().iso().optional().allow(null),
    end_date: Joi.date().iso().optional().allow(null),
    is_active: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')).optional()
}).unknown(true);

const newsSchema = Joi.object({
    title: Joi.string().required(),
    category_id: idSchema.required(),
    publish_date: Joi.date().iso().optional().allow(null),
    status: Joi.alternatives().try(
        Joi.boolean(),
        Joi.string().valid('Publish', 'Draft', 'Active', 'Inactive', 'true', 'false')
    ).optional()
}).unknown(true);

const posterSchema = Joi.object({
    title: Joi.string().required(),
    category_id: idSchema.required(),
    language: Joi.string().optional().allow(''),
    is_premium: Joi.alternatives().try(Joi.boolean(), Joi.string().valid('true', 'false')).optional(),
    status: Joi.string().optional().allow('')
}).unknown(true);

const packageSchema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('CREDIT_BASED', 'SUBSCRIPTION', 'CREDIT').required(),
    category: Joi.string().valid('Leads', 'Posters', 'Both', 'LEADS', 'POSTER', 'BOTH').required(),
    price: Joi.number().min(0).required(),
    credits: Joi.number().min(0).optional(),
    lead_limit: Joi.number().min(0).optional(),
    validity_days: Joi.number().min(1).optional(),
    description: Joi.string().optional().allow(''),
    features: Joi.array().items(Joi.string()).optional(),
    is_active: Joi.boolean().optional(),
    sort_order: Joi.number().optional()
}).unknown(true);

const subscriptionPlanSchema = Joi.object({
    name: Joi.string().required(),
    category: Joi.string().valid('LEADS', 'POSTER', 'BOTH', 'PREMIUM').required(),
    leads_limit: Joi.number().min(0).optional().allow(''),
    poster_limit: Joi.number().min(0).optional().allow(''),
    price: Joi.number().min(0).required(),
    duration: Joi.number().min(1).optional(),
    description: Joi.string().optional().allow(''),
    status: Joi.string().valid('Active', 'Inactive').optional()
}).unknown(true);

const subscriptionSchema = Joi.object({
    user_id: idSchema.required(),
    plan_id: idSchema.required(),
    total_leads: Joi.number().min(0).optional().allow(''),
    used_leads: Joi.number().min(0).optional().allow(''),
    total_posters: Joi.number().min(0).optional().allow(''),
    used_posters: Joi.number().min(0).optional().allow(''),
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().required(),
    status: Joi.string().valid('Active', 'Inactive', 'Expired').optional()
}).unknown(true);

const transactionSchema = Joi.object({
    user_id: idSchema.required(),
    type: Joi.string().valid('PURCHASE', 'CREDIT', 'DEBIT', 'REFUND', 'REFERRAL_CREDIT', 'PAYOUT').optional(),
    amount: Joi.number().min(0).optional(),
    credits: Joi.number().optional().allow(''),
    payment_method: Joi.string().optional().allow(''),
    transaction_id: Joi.string().optional().allow(''),
    status: Joi.string().valid('PENDING', 'COMPLETED', 'FAILED').optional(),
    reference_id: Joi.string().optional().allow(''),
    remarks: Joi.string().optional().allow('')
}).unknown(true);

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional().allow('', null),
    email: Joi.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email'
    }),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional().allow('', null).messages({
        'string.pattern.base': 'Phone number must be exactly 10 digits'
    }),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('user', 'vendor', 'admin').required(),
    referral_code: Joi.string().optional().allow('')
}).unknown(true);

const loginSchema = Joi.object({
    email: Joi.string().required().messages({
        'string.empty': 'Email or Phone is required',
    }),
    password: Joi.string().required()
}).unknown(true);

const walletUpdateSchema = Joi.object({
    amount: Joi.number().positive().required(),
    actionType: Joi.string().valid('CREDIT', 'DEBIT').required(),
    remarks: Joi.string().optional().allow('')
}).unknown(true);

const blockUserSchema = Joi.object({
    isBlocked: Joi.boolean().required()
}).unknown(true);

module.exports = {
    vendorSchema,
    subVendorSchema,
    leadSchema,
    customerSchema,
    categorySchema,
    bannerSchema,
    newsSchema,
    posterSchema,
    packageSchema,
    subscriptionPlanSchema,
    subscriptionSchema,
    transactionSchema,
    registerSchema,
    loginSchema,
    walletUpdateSchema,
    blockUserSchema
};
