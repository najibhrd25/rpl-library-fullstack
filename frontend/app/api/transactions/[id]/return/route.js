import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function PUT(request, props) {
  try {
    const params = await props.params;
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const transactionId = parseInt(params.id, 10);

    const result = await prisma.$transaction(async (prisma) => {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      // Authorization Check
      if (user.role !== 'ADMIN' && transaction.userId !== user.id) {
        throw new Error('Forbidden: You can only return your own books');
      }

      if (transaction.status === 'RETURNED') {
        throw new Error('Book is already returned');
      }

      const updatedTransaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'RETURNED',
          returnDate: new Date(),
        },
      });

      await prisma.book.update({
        where: { id: transaction.bookId },
        data: { stock: { increment: 1 } },
      });

      return updatedTransaction;
    }, {
      maxWait: 10000, 
      timeout: 20000,
    });

    return NextResponse.json({
      status: 'success',
      message: 'Book returned successfully',
      data: { transaction: result },
    }, { status: 200 });
  } catch (err) {
    const status = err.message.includes('not found') || err.message.includes('already returned') ? 400 : 500;
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Error returning book',
    }, { status });
  }
}
