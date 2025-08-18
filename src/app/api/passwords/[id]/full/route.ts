import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const passwordId = params.id;
    
    // Get or create default user safely
    const user = await getOrCreateDefaultUser();

    const password = await db.password.findFirst({
      where: {
        id: passwordId,
        ownerId: user.id
      },
      include: {
        folder: true,
        company: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!password) {
      return NextResponse.json({ error: 'Password not found' }, { status: 404 });
    }

    const transformedPassword = {
      id: password.id,
      title: password.title,
      username: password.username,
      password: password.password,
      url: password.url,
      notes: password.notes,
      icon: password.icon,
      favorite: password.favorite,
      inTrash: password.inTrash,
      lastAccessed: password.lastAccessed?.toISOString() || 'Только что',
      company: password.company?.name,
      folder: password.folder?.name,
      folderId: password.folder?.id,
      companyId: password.company?.id,
      isEncrypted: password.isEncrypted || false
    };

    return NextResponse.json(transformedPassword);
  } catch (error) {
    console.error('Error fetching password:', error);
    return NextResponse.json({ error: 'Failed to fetch password' }, { status: 500 });
  }
}