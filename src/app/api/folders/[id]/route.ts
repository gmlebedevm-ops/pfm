import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user-utils';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { name, description, color, icon, companyId } = body;
    
    // Get or create default user safely
    const user = await getOrCreateDefaultUser();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const updatedFolder = await db.folder.update({
      where: {
        id: params.id,
        ownerId: user.id
      },
      data: {
        name,
        description,
        color,
        icon,
        companyId: companyId || null
      },
      include: {
        _count: {
          select: {
            passwords: true
          }
        },
        company: true
      }
    });

    const transformedFolder = {
      id: updatedFolder.id,
      name: updatedFolder.name,
      description: updatedFolder.description,
      color: updatedFolder.color,
      icon: updatedFolder.icon,
      companyId: updatedFolder.companyId,
      companyName: updatedFolder.company?.name,
      count: updatedFolder._count.passwords,
      createdAt: updatedFolder.createdAt.toISOString(),
      updatedAt: updatedFolder.updatedAt.toISOString()
    };

    return NextResponse.json(transformedFolder);
  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json({ error: 'Failed to update folder' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get or create default user safely
    const user = await getOrCreateDefaultUser();

    // Check if folder exists and belongs to user
    const folder = await db.folder.findFirst({
      where: {
        id: params.id,
        ownerId: user.id
      }
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Delete the folder
    await db.folder.delete({
      where: {
        id: params.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
}