import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
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
