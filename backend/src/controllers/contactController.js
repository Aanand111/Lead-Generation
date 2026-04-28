const contactModel = require('../models/contactModel');

// POST /api/contact — Public (no auth required)
const submitMessage = async (req, res, next) => {
    try {
        const { full_name, email, subject, message } = req.body;

        if (!full_name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: full_name, email, subject, message'
            });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email address.' });
        }

        const saved = await contactModel.submitContactMessage(full_name, email, subject, message);
        res.status(201).json({ success: true, message: 'Message sent successfully!', data: saved });
    } catch (error) {
        next(error);
    }
};

// GET /api/admin/contact-messages — Admin only
const getMessages = async (req, res, next) => {
    try {
        const messages = await contactModel.getContactMessages();
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        next(error);
    }
};

// PUT /api/admin/contact-messages/:id/status — Admin only
const updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Unread', 'Read', 'Resolved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status. Use: Unread, Read, Resolved' });
        }

        const updated = await contactModel.updateContactMessageStatus(id, status);
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        res.status(200).json({ success: true, message: 'Status updated', data: updated });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/admin/contact-messages/:id — Admin only
const deleteMessage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await contactModel.deleteContactMessage(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        res.status(200).json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { submitMessage, getMessages, updateStatus, deleteMessage };