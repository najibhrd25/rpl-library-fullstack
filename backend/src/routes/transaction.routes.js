const express = require('express');
const router = express.Router();

const transactionController = require('../controllers/transaction.controller');
const { auth, isAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { borrowSchema } = require('../validators/transaction.validator');

// @route   GET /api/transactions
// @desc    Get transactions (Admin sees all, Member sees only theirs)
// @access  Private
router.get('/', auth, transactionController.getTransactions);

// @route   POST /api/transactions/borrow
// @desc    Borrow a book and reduce stock
// @access  Private (Member)
router.post('/borrow', auth, validate(borrowSchema), transactionController.borrowBook);

// @route   PUT /api/transactions/:id/return
// @desc    Confirm a returned book and increase stock
// @access  Private (Admin Only)
router.put('/:id/return', auth, isAdmin, transactionController.returnBook);

module.exports = router;
