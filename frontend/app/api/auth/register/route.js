import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({
        status: 'error',
        message: 'Email is already registered.',
      }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Account created successfully',
      data: { user: newUser },
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Internal Server Error',
    }, { status: 500 });
  }
}
