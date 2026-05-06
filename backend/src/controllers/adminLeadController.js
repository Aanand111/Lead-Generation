const adminLeadDb = require('../models/leadModel');
const NotificationService = require('../services/notificationService');
const { pool } = require('../config/db');
const { broadcast } = require('../utils/socket');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isUuid = (value) => UUID_REGEX.test(value || '');

// Function to handle lead uploads from admin or vendor
const uploadLead = async (req, res, next) => {
    try {
        const { lead_id, customer_name, customer_phone, customer_email, category, city, state, pincode, lead_value, expiry_date } = req.body;
        const user = req.user;
        
        // If the user is admin, the lead is active immediately. 
        // If it's a vendor, we mark it as pending for admin approval.
        const initialStatus = user.role === 'admin' ? 'ACTIVE' : 'PENDING';

        // Fixing empty values to be null for DB consistency
        const normalizedLeadValue = (lead_value === '' || lead_value === undefined) ? null : lead_value;
        const normalizedExpiryDate = (expiry_date === '' || expiry_date === undefined || expiry_date === null) 
            ? new Date(new Date().setDate(new Date().getDate() + 30)) 
            : expiry_date;

        const lead = await adminLeadDb.createLead({
            lead_id, customer_name, customer_phone, 
            customer_email: customer_email?.toLowerCase(), 
            category, city, state, pincode, 
            lead_value: normalizedLeadValue, 
            expiry_date: normalizedExpiryDate
        }, user.id, initialStatus);

        // Notify appropriate party via Socket.io & FCM Push
        try {

            if (initialStatus === 'ACTIVE') {
                // If Admin added it, notify targeted users in that city
                const notificationTitle = 'New Lead Available! 🚀';
                const notificationBody = `A new ${category || 'General'} lead is available in ${city}. Buy now!`;

                broadcast('new_lead_added', {
                    message: notificationBody,
                    category: category || 'General',
                    city: city,
                    timestamp: new Date()
                });

                NotificationService.sendPushToCity(city, notificationTitle, notificationBody, {
                    type: 'NEW_LEAD',
                    city: city,
                    category: category || 'General'
                });
            } else {
                // Fetch full uploader details for the notification
                const uploaderRes = await pool.query('SELECT full_name, referred_by FROM users WHERE id = $1', [user.id]);
                const uploader = uploaderRes.rows[0] || { full_name: 'A User', referred_by: null };

                // If Vendor/Sub-Vendor added it, notify ALL ADMINS
                const isSubVendor = !!uploader.referred_by;
                const roleLabel = isSubVendor ? 'Sub-Vendor' : 'Vendor';
                
                const adminTitle = 'New Lead Approval Required 🛡️';
                const adminBody = `${roleLabel} ${uploader.full_name} submitted a new lead for ${category} in ${city}.`;

                await NotificationService.notifyAdmins(adminTitle, adminBody, {
                    type: 'LEAD_APPROVAL_REQUEST',
                    leadId: lead.id,
                    uploaderId: user.id,
                    uploaderRole: user.role,
                    isSubVendor: isSubVendor
                });
            }
        } catch (sErr) {
            console.error('[NOTIFICATION_ERROR] Failed to send notification:', sErr.message);
        }

        res.status(201).json({ success: true, message: 'Lead added successfully', data: lead });
    } catch (error) {
        console.error("Error in uploadLead controller:", error);
        next(error);
    }
};

const editLead = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!isUuid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format. Must be a UUID.' });
        }
        const { lead_id, customer_name, customer_phone, customer_email, category, city, state, pincode, lead_value, expiry_date } = req.body;

        if (!customer_phone || !city) {
            return res.status(400).json({ success: false, message: 'Please provide at least customer phone, and city.' });
        }

        const normalizedLeadValue = (lead_value === '' || lead_value === undefined) ? null : lead_value;
        const normalizedExpiryDate = (expiry_date === '' || expiry_date === undefined) ? null : expiry_date;

        const lead = await adminLeadDb.editLead(id, {
            lead_id, customer_name, customer_phone, 
            customer_email: customer_email?.toLowerCase(), 
            category, city, state, pincode, 
            lead_value: normalizedLeadValue, 
            expiry_date: normalizedExpiryDate
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
        if (!isUuid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format. Must be a UUID.' });
        }
        const lead = await adminLeadDb.deleteLead(id);

        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }

        res.status(200).json({ success: true, message: 'Lead deleted successfully' });
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

const getPendingLeads = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const data = await adminLeadDb.getAllLeads(page, limit, search, 'PENDING');

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

const approveLead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        if (!isUuid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format. Must be a UUID.' });
        }

        const lead = await adminLeadDb.editLead(id, {
            ...req.body,
            status: status || 'ACTIVE'
        });

        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }

        if (status === 'ACTIVE') {
            const NotificationService = require('../services/notificationService');
            const { broadcast } = require('../utils/socket');

            // 1. Fetch uploader details
            let uploaderName = 'System';
            let uploaderRole = 'admin';
            if (lead.created_by) {
                const uploaderRes = await pool.query('SELECT full_name, role FROM users WHERE id = $1', [lead.created_by]);
                if (uploaderRes.rows.length > 0) {
                    uploaderName = uploaderRes.rows[0].full_name || 'A Partner';
                    uploaderRole = uploaderRes.rows[0].role;
                }
            }

            // 2. Notify the uploader themselves
            if (lead.created_by) {
                await NotificationService.sendPushToUserId(lead.created_by, 'Lead Approved! 🎉', `Your lead "${lead.customer_name}" has been approved and is now live.`);
            }

            // 3. SPECIAL Notification for users in the SAME CITY (Urgent)
            const cityLabel = lead.city || 'your area';
            const specialTitle = `Urgent: New Lead in ${cityLabel}! 🔥`;
            const specialBody = `A fresh ${lead.category || 'General'} lead was just uploaded in ${cityLabel} (Pincode: ${lead.pincode || 'N/A'}). Grab it now before someone else does!`;
            
            await NotificationService.sendPushToCity(lead.city, specialTitle, specialBody, {
                type: 'NEW_LEAD',
                leadId: lead.id,
                city: lead.city,
                category: lead.category,
                isSpecial: true
            });

            // 4. GENERAL Notification for ALL OTHER users
            const generalTitle = 'New Lead Alert! 🚀';
            const generalBody = `${uploaderName} uploaded a new ${lead.category || 'General'} lead in ${cityLabel}. Check it out now!`;

            await NotificationService.sendPushToAllExceptCity(lead.city, generalTitle, generalBody, {
                type: 'NEW_LEAD',
                leadId: lead.id,
                city: lead.city,
                category: lead.category,
                uploader: uploaderName,
                isSpecial: false
            });

            // 5. Socket broadcast (Immediate toast for everyone)
            broadcast('new_lead_added', {
                message: generalBody,
                category: lead.category,
                city: lead.city,
                uploader: uploaderName,
                timestamp: new Date()
            });
        }

        res.status(200).json({ success: true, message: `Lead ${status || 'ACTIVE'} successfully`, data: lead });
    } catch (error) {
        next(error);
    }
};

const getLead = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (id === 'pending') {
            return getPendingLeads(req, res, next);
        }

        if (!isUuid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format. Must be a UUID.' });
        }

        const lead = await adminLeadDb.getLeadById(id);
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found.' });
        }
        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadLead,
    editLead,
    getLeads,
    getLead,
    removeLead,
    getPurchasedLeads: getPurchasedLeadsBase,
    getPendingLeads,
    approveLead
};
