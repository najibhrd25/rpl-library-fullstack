const prisma = require('../utils/prisma');

/**
 * Get all transactions
 * Admin can view all. Member can only view their own.
 */
const getTransactions = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    let query = {
      include: {
        book: { select: { title: true, author: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' }
    };

    // If user is a member, only fetch their transactions
    if (userRole === 'MEMBER') {
      query.where = { userId: req.user.id };
    }

    const transactions = await prisma.transaction.findMany(query);

    res.status(200).json({
      status: 'success',
      data: { transactions },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Borrow a book (Member Only)
 */
const borrowBook = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    if (!bookId) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid bookId to borrow.',
      });
    }

    // Wrap in a Prisma Transaction to ensure atomic operation
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check book existence & stock availability
      const book = await tx.book.findUnique({ where: { id: parseInt(bookId) } });
      if (!book) throw new Error('Book not found.');
      if (book.stock < 1) throw new Error(`Book '${book.title}' is currently out of stock.`);

      // 2. Reduce book stock
      await tx.book.update({
        where: { id: book.id },
        data: { stock: book.stock - 1 },
      });

      // 3. Create a transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          bookId: book.id,
          status: 'BORROWED',
        },
      });

      return { transaction, bookTitle: book.title };
    });

    res.status(201).json({
      status: 'success',
      message: `You successfully borrowed '${result.bookTitle}'`,
      data: { transaction: result.transaction },
    });
  } catch (err) {
    // Catch transaction errors
    if (err.message.includes('Book not found') || err.message.includes('out of stock')) {
      return res.status(400).json({ status: 'error', message: err.message });
    }
    next(err);
  }
};

/**
 * Return a book (Admin Confirmation)
 */
const returnBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Use Prisma transaction for atomic changes
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check transaction existence
      const targetTransaction = await tx.transaction.findUnique({
        where: { id: parseInt(id) },
        include: { book: true }
      });

      if (!targetTransaction) throw new Error('Transaction not found.');
      if (targetTransaction.status === 'RETURNED') throw new Error('Book has already been returned.');

      // 2. Increase book stock
      await tx.book.update({
        where: { id: targetTransaction.bookId },
        data: { stock: targetTransaction.book.stock + 1 },
      });

      // 3. Update transaction status and set return date
      const returnedTransaction = await tx.transaction.update({
        where: { id: targetTransaction.id },
        data: {
          status: 'RETURNED',
          returnDate: new Date(),
        },
      });

      return returnedTransaction;
    });

    res.status(200).json({
      status: 'success',
      message: 'Book return has been confirmed successfully.',
      data: { transaction: result },
    });
  } catch (err) {
    if (err.message.includes('Transaction not found') || err.message.includes('already been returned')) {
      return res.status(400).json({ status: 'error', message: err.message });
    }
    next(err);
  }
};

module.exports = {
  getTransactions,
  borrowBook,
  returnBook,
};
