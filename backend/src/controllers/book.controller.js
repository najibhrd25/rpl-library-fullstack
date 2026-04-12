const prisma = require('../utils/prisma');
const fs = require('fs');
const path = require('path');

/**
 * Get all books (with search & filter)
 */
const getBooks = async (req, res, next) => {
  try {
    const { title, categoryId } = req.query;

    const query = {
      where: {},
      include: {
        category: {
          select: { name: true }
        }
      }
    };

    if (title) {
      query.where.title = {
        contains: title,
        mode: 'insensitive' // case-insensitive search
      };
    }

    if (categoryId) {
      query.where.categoryId = parseInt(categoryId, 10);
    }

    const books = await prisma.book.findMany(query);
    
    res.status(200).json({
      status: 'success',
      data: { books }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new book (Admin Only)
 */
const createBook = async (req, res, next) => {
  try {
    const { title, author, description, stock, categoryId } = req.body;
    let coverImage = null;

    if (req.file) {
      coverImage = `/uploads/covers/${req.file.filename}`;
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        description,
        stock: parseInt(stock, 10),
        categoryId: parseInt(categoryId, 10),
        coverImage
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Book created successfully',
      data: { book }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing book (Admin Only)
 */
const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, author, description, stock, categoryId } = req.body;

    const existingBook = await prisma.book.findUnique({ where: { id: parseInt(id) } });
    if (!existingBook) {
      return res.status(404).json({ status: 'error', message: 'Book not found' });
    }

    let coverImage = existingBook.coverImage;

    if (req.file) {
      coverImage = `/uploads/covers/${req.file.filename}`;
      // Optional: Delete old image
      if (existingBook.coverImage) {
        const oldImagePath = path.join(__dirname, '..', '..', existingBook.coverImage);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
    }

    const book = await prisma.book.update({
      where: { id: parseInt(id) },
      data: {
        title: title || existingBook.title,
        author: author || existingBook.author,
        description: description || existingBook.description,
        stock: stock !== undefined ? parseInt(stock, 10) : existingBook.stock,
        categoryId: categoryId !== undefined ? parseInt(categoryId, 10) : existingBook.categoryId,
        coverImage
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Book updated successfully',
      data: { book }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a book (Admin Only)
 */
const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({ where: { id: parseInt(id) } });
    if (!book) {
      return res.status(404).json({ status: 'error', message: 'Book not found' });
    }

    // Delete image file if exists
    if (book.coverImage) {
      const imagePath = path.join(__dirname, '..', '..', book.coverImage);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await prisma.book.delete({ where: { id: parseInt(id) } });

    res.status(200).json({
      status: 'success',
      message: 'Book deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBooks,
  createBook,
  updateBook,
  deleteBook
};
