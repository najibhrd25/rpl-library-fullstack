import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    // Auto-return lazy evaluation (Berdasarkan Due Date yang dipilih peminjam)
    // Deteksi buku yang telat dikembalikan melewati Due Date
    const now = new Date();

    const expiredTransactions = await prisma.transaction.findMany({
      where: {
        status: 'BORROWED',
        dueDate: { lt: now }
      }
    });

    // Proses pengembalian otomatis
    if (expiredTransactions.length > 0) {
      for (const t of expiredTransactions) {
        await prisma.$transaction([
          prisma.transaction.update({
            where: { id: t.id },
            data: { status: 'RETURNED', returnDate: new Date() }
          }),
          prisma.book.update({
            where: { id: t.bookId },
            data: { stock: { increment: 1 } }
          })
        ]);
      }
    }

    let transactions;
    if (user.role === 'ADMIN') {
      transactions = await prisma.transaction.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          book: { select: { id: true, title: true } },
        },
        orderBy: { borrowDate: 'desc' },
      });
    } else {
      transactions = await prisma.transaction.findMany({
        where: { userId: user.id },
        include: {
          book: { select: { id: true, title: true } },
        },
        orderBy: { borrowDate: 'desc' },
      });
    }

    return NextResponse.json({
      status: 'success',
      data: { transactions },
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Error fetching transactions',
    }, { status: 500 });
  }
}
