import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Check if default user already exists
    const existingUser = await db.user.findFirst({
      where: {
        email: 'default@example.com'
      }
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Default user already exists', user: existingUser });
    }

    // Create default user
    const defaultUser = await db.user.create({
      data: {
        email: 'default@example.com',
        name: 'Default User',
        role: 'USER'
      }
    });

    return NextResponse.json({ message: 'Default user created successfully', user: defaultUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating default user:', error);
    return NextResponse.json({ error: 'Failed to create default user' }, { status: 500 });
  }
}