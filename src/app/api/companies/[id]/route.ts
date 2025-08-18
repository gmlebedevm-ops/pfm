import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user-utils';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Get or create default user safely
    const user = await getOrCreateDefaultUser();

    const { name, description, logo } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const existingCompany = await db.company.findFirst({
      where: {
        id: params.id,
        ownerId: user.id
      }
    });

    if (!existingCompany) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const updatedCompany = await db.company.update({
      where: {
        id: params.id
      },
      data: {
        name,
        description,
        logo
      },
      include: {
        _count: {
          select: {
            passwords: true,
            folders: true
          }
        }
      }
    });

    const transformedCompany = {
      id: updatedCompany.id,
      name: updatedCompany.name,
      description: updatedCompany.description,
      logo: updatedCompany.logo,
      count: updatedCompany._count.passwords + updatedCompany._count.folders
    };

    return NextResponse.json(transformedCompany);
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get or create default user safely
    const user = await getOrCreateDefaultUser();

    const existingCompany = await db.company.findFirst({
      where: {
        id: params.id,
        ownerId: user.id
      }
    });

    if (!existingCompany) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    await db.company.delete({
      where: {
        id: params.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
  }
}