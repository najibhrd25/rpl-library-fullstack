const express = require('express');
const router = express.Router();

const bookController = require('../controllers/book.controller');
const upload = require('../middlewares/upload.middleware');
const { auth, isAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createBookSchema, updateBookSchema } = require('../validators/book.validator');

// @route   GET /api/books
// @desc    Get all books (Public or Member - here anyone can view, or adjust if Member only)
// @access  Public
router.get('/', bookController.getBooks);

// @route   POST /api/books
// @desc    Create a new book with cover upload
// @access  Private (Admin Only)
router.post(
  '/',
  auth,
  isAdmin,
  upload.single('coverImage'),
  validate(createBookSchema),
  bookController.createBook
);

// @route   PUT /api/books/:id
// @desc    Update a book
// @access  Private (Admin Only)
router.put(
  '/:id',
  auth,
  isAdmin,
  upload.single('coverImage'), // In case they want to update the cover
  validate(updateBookSchema),
  bookController.updateBook
);

// @route   DELETE /api/books/:id
// @desc    Delete a book
// @access  Private (Admin Only)
router.delete('/:id', auth, isAdmin, bookController.deleteBook);

module.exports = router;
