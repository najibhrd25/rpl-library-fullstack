import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    const categoryId = searchParams.get('categoryId');

    const where = {};
    if (title) where.title = { contains: title, mode: 'insensitive' };
    if (categoryId) where.categoryId = parseInt(categoryId, 10);

    const books = await prisma.book.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      status: 'success',
      data: { books },
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Error fetching books',
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ status: 'error', message: 'Forbidden: Admins only' }, { status: 403 });
    }

    const formData = await request.formData();
    const title = formData.get('title');
    const author = formData.get('author');
    const description = formData.get('description');
    const stock = parseInt(formData.get('stock') || '0', 10);
    const categoryId = parseInt(formData.get('categoryId') || '0', 10);
    const coverImageFile = formData.get('coverImage');

    if (!title || !author || stock < 0 || categoryId <= 0) {
      return NextResponse.json({ status: 'error', message: 'Invalid text inputs' }, { status: 400 });
    }

    let coverImagePath = null;
    if (coverImageFile && coverImageFile.name) {
      const buffer = Buffer.from(await coverImageFile.arrayBuffer());
      const ext = path.extname(coverImageFile.name);
      const filename = `coverImage-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'covers');

      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      
      // Save accessible path
      coverImagePath = `/uploads/covers/${filename}`;
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        description,
        stock,
        categoryId,
        ...(coverImagePath && { coverImage: coverImagePath }),
      },
      include: { category: true },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Book created successfully',
      data: { book },
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Error creating book',
    }, { status: 500 });
  }
}
