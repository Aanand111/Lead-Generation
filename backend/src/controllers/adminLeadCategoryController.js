const adminLeadCategoryModel = require('../models/adminLeadCategoryModel');

const addLeadCategory = async (req, res, next) => {
    try {
        const { name, status } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }
        const newCategory = await adminLeadCategoryModel.createLeadCategory(name, status);
        res.status(201).json({ success: true, message: 'Category added successfully', data: newCategory });
    } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
            return res.status(400).json({ success: false, message: 'Category name already exists' });
        }
        next(error);
    }
};

const getLeadCategories = async (req, res, next) => {
    try {
        const categories = await adminLeadCategoryModel.getLeadCategories();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

const editLeadCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, status } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }
        const updatedCategory = await adminLeadCategoryModel.updateLeadCategory(id, name, status);
        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ success: true, message: 'Category updated successfully', data: updatedCategory });
    } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
            return res.status(400).json({ success: false, message: 'Category name already exists' });
        }
        next(error);
    }
};

const removeLeadCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await adminLeadCategoryModel.deleteLeadCategory(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addLeadCategory,
    getLeadCategories,
    editLeadCategory,
    removeLeadCategory
};
