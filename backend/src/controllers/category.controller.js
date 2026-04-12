const prisma = require('../utils/prisma');

/**
 * Get all categories
 * Access: Public
 */
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { books: true } } // Show how many books in that category
      }
    });

    res.status(200).json({
      status: 'success',
      data: { categories },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new category
 * Access: Admin Only
 */
const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      return res.status(400).json({
        status: 'error',
        message: 'Category with this name already exists.',
      });
    }

    const category = await prisma.category.create({
      data: { name },
    });

    res.status(201).json({
      status: 'success',
      message: 'Category created successfully.',
      data: { category },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing category
 * Access: Admin Only
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Ensure category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCategory) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found.',
      });
    }

    // Ensure new name is not already taken by another category
    const duplicateCheck = await prisma.category.findUnique({
      where: { name },
    });

    if (duplicateCheck && duplicateCheck.id !== parseInt(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Another category with this name already exists.',
      });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name },
    });

    res.status(200).json({
      status: 'success',
      message: 'Category updated successfully.',
      data: { category: updatedCategory },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a category
 * Access: Admin Only
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: { _count: { select: { books: true } } }
    });

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found.',
      });
    }

    // Prevent deletion if the category has associated books
    if (category._count.books > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete category because there are books associated with it.',
      });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully.',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
