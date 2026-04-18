import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'MEMBER') {
      return NextResponse.json({ status: 'error', message: 'Forbidden: Members only' }, { status: 403 });
    }

    const { bookId, durationDays = 7 } = await request.json();

    const result = await prisma.$transaction(async (prisma) => {
      const book = await prisma.book.findUnique({ where: { id: bookId } });
      if (!book) {
        throw new Error('Book not found');
      }
      if (book.stock < 1) {
        throw new Error('Book is currently out of stock');
      }

      await prisma.book.update({
        where: { id: bookId },
        data: { stock: book.stock - 1 },
      });

      // Kalkulasi tanggal pengembalian
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + parseInt(durationDays, 10));

      const transaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          bookId,
          dueDate,
          status: 'BORROWED',
        },
      });

      return transaction;
    }, {
      maxWait: 10000, // default is 2000
      timeout: 20000, // default is 5000
    });

    return NextResponse.json({
      status: 'success',
      message: 'Book borrowed successfully',
      data: { transaction: result },
    }, { status: 201 });
  } catch (err) {
    const status = err.message.includes('not found') || err.message.includes('stock') ? 400 : 500;
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Error borrowing book',
    }, { status });
  }
}
