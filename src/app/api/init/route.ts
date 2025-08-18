import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Check if demo user already exists
    const existingDemoUser = await db.user.findFirst({
      where: {
        email: 'admin@passflow.ru'
      }
    });

    if (!existingDemoUser) {
      // Create demo user
      const demoUser = await db.user.create({
        data: {
          email: 'admin@passflow.ru',
          name: 'Admin User',
          role: 'SUPER_ADMIN'
        }
      });
      console.log('Demo user created:', demoUser);
    }

    // Check if default user already exists
    const existingDefaultUser = await db.user.findFirst({
      where: {
        email: 'default@example.com'
      }
    });

    if (!existingDefaultUser) {
      // Create default user
      const defaultUser = await db.user.create({
        data: {
          email: 'default@example.com',
          name: 'Default User',
          role: 'USER'
        }
      });
      console.log('Default user created:', defaultUser);
    }

    return NextResponse.json({ 
      message: 'Database initialized successfully', 
      demoUser: existingDemoUser || { email: 'admin@passflow.ru' },
      defaultUser: existingDefaultUser || { email: 'default@example.com' }
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
  }
}