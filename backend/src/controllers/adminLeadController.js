const adminLeadDb = require('../models/leadModel');

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
            const { getIO } = require('../utils/socket');
            const NotificationService = require('../services/notificationService');
            const io = getIO();

            if (initialStatus === 'ACTIVE') {
                // If Admin added it, notify EVERYONE
                const notificationTitle = 'New Lead Available! 🚀';
                const notificationBody = `A new ${category || 'General'} lead is available in ${city}. Buy now!`;

                io.emit('new_lead_added', {
                    message: notificationBody,
                    category: category || 'General',
                    city: city,
                    timestamp: new Date()
                });

                NotificationService.sendPushToAllUsers(notificationTitle, notificationBody, {
                    type: 'NEW_LEAD',
                    city: city,
                    category: category || 'General'
                });
            } else {
                // If Vendor added it, notify ONLY ADMINS
                io.emit('admin_notification', {
                    title: 'New Lead Approval Required 🛡️',
                    body: `Vendor ${user.full_name} submitted a new lead for ${category} in ${city}.`,
                    timestamp: new Date()
                });
                
                // You can also send email to admin if configured
            }
        } catch (sErr) {
            console.error('[NOTIFICATION_ERROR] Failed to send notification:', sErr.message);
        }


        res.status(201).json({ success: true, message: 'Lead added successfully', data: lead });
    } catch (error) {
        // Pass error to global error handler
        console.error("Error in uploadLead controller:", error);
        next(error);
    }
};

const editLead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format. Must be a UUID.' });
        }
        const { lead_id, customer_name, customer_phone, customer_email, category, city, state, pincode, lead_value, expiry_date } = req.body;

        if (!customer_phone || !city) {
            return res.status(400).json({ success: false, message: 'Please provide at least customer phone, and city.' });
        }

        // Normalize numeric and date fields
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
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
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
        try {
            const pool = require('../config/db').pool;
            const schemaRes = await pool.query(`
                SELECT table_name, column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name IN ('lead_purchases', 'leads', 'user_packages', 'packages') 
                AND data_type LIKE '%ARRAY%' OR data_type LIKE '%[]%'
            `);
            res.status(200).json({ 
                success: false, 
                message: error.message, 
                stack: error.stack,
                arrayColumns: schemaRes.rows
            });
        } catch (e) {
            res.status(200).json({ success: false, message: error.message, stack: error.stack, innerError: e.message });
        }
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
        const { status } = req.body; // Status can be ACTIVE or REJECTED

        const lead = await adminLeadDb.editLead(id, {
            ...req.body,
            status: status || 'ACTIVE'
        });

        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }

        // Notify Vendor about approval if applicable
        if (status === 'ACTIVE') {
            const NotificationService = require('../services/notificationService');
            const { getIO } = require('../utils/socket');
            const io = getIO();

            // 1. Notify the individual vendor who created it
            if (lead.created_by) {
                NotificationService.sendPushToUserId(lead.created_by, 'Lead Approved! 🎉', `Your lead "${lead.customer_name}" has been approved and is now live.`);
            }

            // 2. Broadcast to ALL users (as requested: "sare vendors ko notification jaega")
            const broadcastTitle = 'New Approved Lead! 🔥';
            const broadcastBody = `A fresh approved lead is now available in ${lead.city || 'your area'}.`;
            
            io.emit('new_lead_added', {
                message: broadcastBody,
                category: lead.category,
                city: lead.city,
                timestamp: new Date()
            });

            NotificationService.sendPushToAllUsers(broadcastTitle, broadcastBody, {
                type: 'NEW_LEAD',
                leadId: lead.id
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
