import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function PUT(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ status: 'error', message: 'Forbidden: Admins only' }, { status: 403 });
    }

    const transactionId = parseInt(params.id, 10);

    const result = await prisma.$transaction(async (prisma) => {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
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
