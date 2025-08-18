import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user-utils';

export async function GET(request: NextRequest) {
  try {
    // Get or create default user safely
    const user = await getOrCreateDefaultUser();

    const folders = await db.folder.findMany({
      where: {
        ownerId: user.id
      },
      include: {
        company: true,
        _count: {
          select: {
            passwords: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const transformedFolders = folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      description: folder.description,
      color: folder.color,
      icon: folder.icon,
      companyId: folder.companyId,
      companyName: folder.company?.name,
      count: folder._count.passwords,
      createdAt: folder.createdAt.toISOString(),
      updatedAt: folder.updatedAt.toISOString()
    }));

    return NextResponse.json(transformedFolders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get or create default user safely
    const user = await getOrCreateDefaultUser();

    const { name, description, color, icon, companyId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newFolder = await db.folder.create({
      data: {
        name,
        description,
        color,
        icon,
        companyId: companyId === 'none' ? null : companyId,
        ownerId: user.id
      },
      include: {
        company: true,
        _count: {
          select: {
            passwords: true
          }
        }
      }
    });

    const transformedFolder = {
      id: newFolder.id,
      name: newFolder.name,
      description: newFolder.description,
      color: newFolder.color,
      icon: newFolder.icon,
      companyId: newFolder.companyId,
      companyName: newFolder.company?.name,
      count: newFolder._count.passwords,
      createdAt: newFolder.createdAt.toISOString(),
      updatedAt: newFolder.updatedAt.toISOString()
    };

    return NextResponse.json(transformedFolder, { status: 201 });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}