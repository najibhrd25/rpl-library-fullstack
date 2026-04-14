import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({
        status: 'error',
        message: 'You are not logged in! Please log in to get access.',
      }, { status: 401 });
    }

    return NextResponse.json({
      status: 'success',
      data: { user },
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Internal Server Error',
    }, { status: 500 });
  }
}
