import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user-utils';

export async function GET(request: NextRequest) {
  try {
    // Get or create default user safely
    const user = await getOrCreateDefaultUser();

    const companies = await db.company.findMany({
      where: {
        ownerId: user.id
      },
      include: {
        _count: {
          select: {
            passwords: true,
            folders: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const transformedCompanies = companies.map(company => ({
      id: company.id,
      name: company.name,
      description: company.description,
      logo: company.logo,
      count: company._count.passwords + company._count.folders
    }));

    return NextResponse.json(transformedCompanies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get or create default user safely
    const user = await getOrCreateDefaultUser();

    const { name, description, logo } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newCompany = await db.company.create({
      data: {
        name,
        description,
        logo,
        ownerId: user.id
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
      id: newCompany.id,
      name: newCompany.name,
      description: newCompany.description,
      logo: newCompany.logo,
      count: newCompany._count.passwords + newCompany._count.folders
    };

    return NextResponse.json(transformedCompany, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}