import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';
import { promises as fs } from 'fs';
import path from 'path';

export async function PUT(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ status: 'error', message: 'Forbidden: Admins only' }, { status: 403 });
    }

    const formData = await request.formData();
    const title = formData.get('title');
    const author = formData.get('author');
    const description = formData.get('description');
    const stock = formData.get('stock') !== null ? parseInt(formData.get('stock'), 10) : undefined;
    const categoryId = formData.get('categoryId') !== null ? parseInt(formData.get('categoryId'), 10) : undefined;
    const coverImageFile = formData.get('coverImage');

    let coverImagePath = undefined;
    if (coverImageFile && coverImageFile.name) {
      const buffer = Buffer.from(await coverImageFile.arrayBuffer());
      const ext = path.extname(coverImageFile.name);
      const filename = `coverImage-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'covers');

      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      
      coverImagePath = `/uploads/covers/${filename}`;

      // Optional: Clean up old cover image here if necessary
    }

    const dataToUpdate = {};
    if (title) dataToUpdate.title = title;
    if (author) dataToUpdate.author = author;
    if (description !== undefined) dataToUpdate.description = description;
    if (stock !== undefined) dataToUpdate.stock = stock;
    if (categoryId) dataToUpdate.categoryId = categoryId;
    if (coverImagePath) dataToUpdate.coverImage = coverImagePath;

    const book = await prisma.book.update({
      where: { id: parseInt(params.id, 10) },
      data: dataToUpdate,
      include: { category: true },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Book updated successfully',
      data: { book },
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Error updating book',
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ status: 'error', message: 'Forbidden: Admins only' }, { status: 403 });
    }

    await prisma.book.delete({
      where: { id: parseInt(params.id, 10) },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Book deleted successfully',
      data: null,
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Error deleting book',
    }, { status: 500 });
  }
}
