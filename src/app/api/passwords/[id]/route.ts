import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const passwordId = params.id;
    
    // Get or create default user
    let user = await db.user.findFirst({
      where: {
        email: 'default@example.com'
      }
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: 'default@example.com',
          name: 'Default User',
          role: 'USER'
        }
      });
    }

    const { title, username, password, url, notes, icon, favorite, inTrash, folderId, companyId } = body;

    // Check if password exists and belongs to user
    const existingPassword = await db.password.findFirst({
      where: {
        id: passwordId,
        ownerId: user.id
      }
    });

    if (!existingPassword) {
      return NextResponse.json({ error: 'Password not found' }, { status: 404 });
    }

    const updatedPassword = await db.password.update({
      where: { id: passwordId },
      data: {
        ...(title && { title }),
        ...(username !== undefined && { username }),
        ...(password && { password }),
        ...(url !== undefined && { url }),
        ...(notes !== undefined && { notes }),
        ...(icon !== undefined && { icon }),
        ...(favorite !== undefined && { favorite }),
        ...(inTrash !== undefined && { inTrash }),
        ...(folderId !== undefined && { folderId }),
        ...(companyId !== undefined && { companyId })
      },
      include: {
        folder: true,
        company: true
      }
    });

    const transformedPassword = {
      id: updatedPassword.id,
      title: updatedPassword.title,
      username: updatedPassword.username,
      url: updatedPassword.url,
      icon: updatedPassword.icon,
      favorite: updatedPassword.favorite,
      inTrash: updatedPassword.inTrash,
      lastAccessed: updatedPassword.lastAccessed?.toISOString() || 'Только что',
      company: updatedPassword.company?.name,
      folder: updatedPassword.folder?.name
    };

    return NextResponse.json(transformedPassword);
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const passwordId = params.id;
    
    // Get or create default user
    let user = await db.user.findFirst({
      where: {
        email: 'default@example.com'
      }
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: 'default@example.com',
          name: 'Default User',
          role: 'USER'
        }
      });
    }

    // Check if password exists and belongs to user
    const existingPassword = await db.password.findFirst({
      where: {
        id: passwordId,
        ownerId: user.id
      }
    });

    if (!existingPassword) {
      return NextResponse.json({ error: 'Password not found' }, { status: 404 });
    }

    await db.password.delete({
      where: { id: passwordId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting password:', error);
    return NextResponse.json({ error: 'Failed to delete password' }, { status: 500 });
  }
}