const adminLeadDb = require('../models/leadModel');
const NotificationService = require('../services/notificationService');
const { pool } = require('../config/db');
const { broadcast } = require('../utils/socket');
const { enqueueLeadApprovalNotification } = require('../queues/notificationQueue');

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
            // 1. Resolve uploader name for notification message
            let uploaderName = 'System';
            if (lead.created_by) {
                const uploaderRes = await pool.query(
                    'SELECT full_name FROM users WHERE id = $1',
                    [lead.created_by]
                );
                uploaderName = uploaderRes.rows[0]?.full_name || 'A Partner';
            }

            // 2. Enqueue ONE background job — worker handles all FCM pushes
            //    This replaces the previous synchronous sendPushToCity +
            //    sendPushToAllExceptCity calls that blocked the admin response.
            await enqueueLeadApprovalNotification(lead, uploaderName);

            // 3. Socket.io broadcast is a cheap in-memory emit — keep it inline
            //    so the admin panel gets the real-time toast immediately.
            broadcast('new_lead_added', {
                message: `${uploaderName} uploaded a new ${lead.category || 'General'} lead in ${lead.city || 'your area'}.`,
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

const xlsx = require('xlsx');

const importLeads = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an Excel or CSV file.' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows = xlsx.utils.sheet_to_json(sheet);

        if (!rawRows || rawRows.length === 0) {
            return res.status(400).json({ success: false, message: 'The uploaded file is empty.' });
        }

        const adminId = req.user.id;
        const status = 'ACTIVE'; 
        const leadsToInsert = [];
        const errors = [];

        rawRows.forEach((row, idx) => {
            const normalizedRow = {};
            Object.keys(row).forEach(key => {
                const normKey = key.toLowerCase().trim().replace(/[\s_]+/g, '_');
                normalizedRow[normKey] = row[key];
            });

            const customer_name = normalizedRow.customer_name || normalizedRow.name || normalizedRow.client_name || '';
            const customer_phone = String(normalizedRow.customer_phone || normalizedRow.phone || normalizedRow.mobile || '').trim();
            const customer_email = normalizedRow.customer_email || normalizedRow.email ? String(normalizedRow.customer_email || normalizedRow.email).trim().toLowerCase() : null;
            const category = normalizedRow.category || normalizedRow.lead_category || normalizedRow.type || 'General';
            const city = String(normalizedRow.city || '').trim();
            const state = normalizedRow.state ? String(normalizedRow.state).trim() : null;
            const pincode = normalizedRow.pincode || normalizedRow.pin || normalizedRow.zip ? String(normalizedRow.pincode || normalizedRow.pin || normalizedRow.zip).trim() : null;
            
            let lead_value = normalizedRow.lead_value || normalizedRow.value || normalizedRow.price || null;
            if (lead_value !== null) {
                lead_value = parseFloat(lead_value);
                if (isNaN(lead_value)) lead_value = null;
            }

            let expiry_date = normalizedRow.expiry_date || normalizedRow.expiry || null;
            if (expiry_date) {
                const parsedDate = new Date(expiry_date);
                if (!isNaN(parsedDate.getTime())) {
                    expiry_date = parsedDate;
                } else {
                    expiry_date = new Date(new Date().setDate(new Date().getDate() + 30));
                }
            } else {
                expiry_date = new Date(new Date().setDate(new Date().getDate() + 30));
            }

            const lead_id = normalizedRow.lead_id || normalizedRow.id ? String(normalizedRow.lead_id || normalizedRow.id).trim() : null;

            if (!customer_phone) {
                errors.push(`Row ${idx + 2}: Missing phone number.`);
                return;
            }
            if (!city) {
                errors.push(`Row ${idx + 2}: Missing city.`);
                return;
            }

            leadsToInsert.push({
                lead_id,
                customer_name,
                customer_phone,
                customer_email,
                category,
                city,
                state,
                pincode,
                lead_value,
                expiry_date,
                created_by: adminId,
                status
            });
        });

        if (leadsToInsert.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid leads found in the Excel sheet.',
                errors
            });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const lead of leadsToInsert) {
                await client.query(
                    `INSERT INTO leads (lead_id, customer_name, customer_phone, customer_email, category, city, state, pincode, lead_value, expiry_date, created_by, status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                    [
                        lead.lead_id,
                        lead.customer_name,
                        lead.customer_phone,
                        lead.customer_email,
                        lead.category,
                        lead.city,
                        lead.state,
                        lead.pincode,
                        lead.lead_value,
                        lead.expiry_date,
                        lead.created_by,
                        lead.status
                    ]
                );
            }
            await client.query('COMMIT');
        } catch (dbErr) {
            await client.query('ROLLBACK');
            throw dbErr;
        } finally {
            client.release();
        }

        res.status(200).json({
            success: true,
            message: `Successfully integrated ${leadsToInsert.length} leads into the system!`,
            importedCount: leadsToInsert.length,
            ignoredCount: errors.length,
            errors: errors.length > 0 ? errors : null
        });

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
    approveLead,
    importLeads
};
