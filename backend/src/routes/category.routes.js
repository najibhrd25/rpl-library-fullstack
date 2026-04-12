const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/category.controller');
const { auth, isAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { categorySchema } = require('../validators/category.validator');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', categoryController.getAllCategories);

// @route   POST /api/categories
// @desc    Create a category
// @access  Private (Admin Only)
router.post('/', auth, isAdmin, validate(categorySchema), categoryController.createCategory);

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private (Admin Only)
router.put('/:id', auth, isAdmin, validate(categorySchema), categoryController.updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private (Admin Only)
router.delete('/:id', auth, isAdmin, categoryController.deleteCategory);

module.exports = router;
