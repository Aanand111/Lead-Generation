const adminNewsCategoryModel = require('../models/adminNewsCategoryModel');

const addNewsCategory = async (req, res, next) => {
    try {
        const { name, status, created_at } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }
        const newCategory = await adminNewsCategoryModel.createNewsCategory(name, status, created_at);
        res.status(201).json({ success: true, message: 'Category added successfully', data: newCategory });
    } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
            return res.status(400).json({ success: false, message: 'Category name already exists' });
        }
        next(error);
    }
};

const getNewsCategories = async (req, res, next) => {
    try {
        const categories = await adminNewsCategoryModel.getNewsCategories();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

const editNewsCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, status, created_at } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }
        const updatedCategory = await adminNewsCategoryModel.updateNewsCategory(id, name, status, created_at);
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

const removeNewsCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await adminNewsCategoryModel.deleteNewsCategory(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addNewsCategory,
    getNewsCategories,
    editNewsCategory,
    removeNewsCategory
};
