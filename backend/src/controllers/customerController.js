const customerDb = require('../models/customerModel');

const getCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const customer = await customerDb.getCustomerById(id);

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.status(200).json({
            success: true,
            data: customer
        });
    } catch (error) {
        next(error);
    }
};

const getCustomers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const data = await customerDb.getAllCustomers(page, limit, search);

        res.status(200).json({
            success: true,
            data: data.customers,
            pagination: {
                total: data.total,
                page,
                limit,
                pages: Math.ceil(data.total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

const addCustomer = async (req, res, next) => {
    try {
        const customerData = req.body;

        if (!customerData.name || (!customerData.phone && !customerData.whatsapp)) {
            return res.status(400).json({ success: false, message: 'Name, and phone or whatsapp are required' });
        }

        const newCustomer = await customerDb.createCustomer(customerData);

        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            data: newCustomer,
        });
    } catch (error) {
        next(error);
    }
};

const updateCustomerStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Active' or 'Inactive'

        const customer = await customerDb.updateCustomerStatus(id, status);

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Customer status updated successfully',
            data: customer,
        });
    } catch (error) {
        next(error);
    }
};

const updateCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const customerData = req.body;

        const updatedCustomer = await customerDb.updateCustomer(id, customerData);

        if (!updatedCustomer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Customer updated successfully',
            data: updatedCustomer,
        });
    } catch (error) {
        next(error);
    }
};

const removeCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;

        const customer = await customerDb.deleteCustomer(id);

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Customer deleted successfully',
            data: customer
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCustomers,
    getCustomer,
    addCustomer,
    updateCustomer,
    updateCustomerStatus,
    removeCustomer
};
