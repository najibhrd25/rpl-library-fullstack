import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';

export async function PUT(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ status: 'error', message: 'Forbidden: Admins only' }, { status: 403 });
    }

    const { name } = await request.json();
    const category = await prisma.category.update({
      where: { id: parseInt(params.id, 10) },
      data: { name },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Category updated successfully',
      data: { category },
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Error updating category',
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ status: 'error', message: 'Forbidden: Admins only' }, { status: 403 });
    }

    await prisma.category.delete({
      where: { id: parseInt(params.id, 10) },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Category deleted successfully',
      data: null,
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Error deleting category',
    }, { status: 500 });
  }
}
