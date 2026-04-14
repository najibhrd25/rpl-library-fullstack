import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { generateToken } from '@/lib/auth-server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid email or password.',
      }, { status: 401 });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid email or password.',
      }, { status: 401 });
    }

    const token = generateToken(user);

    return NextResponse.json({
      status: 'success',
      message: 'Logged in successfully',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Internal Server Error',
    }, { status: 500 });
  }
}
