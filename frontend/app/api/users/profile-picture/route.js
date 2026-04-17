import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';


export async function PUT(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const profilePictureFile = formData.get('profilePicture');

    if (!profilePictureFile || !profilePictureFile.name) {
      return NextResponse.json({ status: 'error', message: 'No image uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await profilePictureFile.arrayBuffer());
    const mimeType = profilePictureFile.type || 'image/jpeg';
    const profilePicturePath = `data:${mimeType};base64,${buffer.toString('base64')}`;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { profilePicture: profilePicturePath },
      select: { id: true, name: true, email: true, role: true, profilePicture: true },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Profile picture updated successfully',
      data: { user: updatedUser },
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Error updating profile picture',
    }, { status: 500 });
  }
}
