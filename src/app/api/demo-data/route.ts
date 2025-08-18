import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user-utils';

export async function POST(request: NextRequest) {
  try {
    console.log('Creating demo data...');
    
    // Get or create default user
    const user = await getOrCreateDefaultUser();
    console.log('User:', user);

    // Check if demo data already exists
    const existingCompanies = await db.company.findMany({
      where: {
        ownerId: user.id
      }
    });

    if (existingCompanies.length > 0) {
      return NextResponse.json({ 
        message: 'Demo data already exists',
        companies: existingCompanies.length 
      });
    }

    // Create demo company
    const demoCompany = await db.company.create({
      data: {
        name: 'Технологии Будущего',
        description: 'Разработка инновационных IT-решений',
        ownerId: user.id
      }
    });
    console.log('Demo company created:', demoCompany);

    // Create demo folder
    const demoFolder = await db.folder.create({
      data: {
        name: 'Рабочие пароли',
        description: 'Основные рабочие аккаунты',
        color: '#3b82f6',
        icon: '💼',
        ownerId: user.id
      }
    });
    console.log('Demo folder created:', demoFolder);

    // Create demo folder with company
    const demoFolderWithCompany = await db.folder.create({
      data: {
        name: 'Личные проекты',
        description: 'Персональные проекты и аккаунты',
        color: '#10b981',
        icon: '🏠',
        companyId: demoCompany.id,
        ownerId: user.id
      }
    });
    console.log('Demo folder with company created:', demoFolderWithCompany);

    console.log('Demo data created successfully!');

    return NextResponse.json({ 
      message: 'Demo data created successfully',
      company: demoCompany,
      folders: [demoFolder, demoFolderWithCompany]
    });

  } catch (error) {
    console.error('Error creating demo data:', error);
    return NextResponse.json({ error: 'Failed to create demo data' }, { status: 500 });
  }
}