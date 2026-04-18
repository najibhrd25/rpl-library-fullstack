import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { books: true }
        }
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      status: 'success',
      data: { categories },
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Error fetching categories',
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ status: 'error', message: 'Forbidden: Admins only' }, { status: 403 });
    }

    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ status: 'error', message: 'Name is required' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: { name },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Category created successfully',
      data: { category },
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Error creating category',
    }, { status: 500 });
  }
}
