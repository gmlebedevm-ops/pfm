import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user-utils';
import { Encryption } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'all';
    const folderId = searchParams.get('folderId');
    const companyId = searchParams.get('companyId');
    
    // Get or create default user safely
    const user = await getOrCreateDefaultUser();

    let whereClause: any = {
      ownerId: user.id,
      inTrash: false
    };

    if (view === 'favorites') {
      whereClause.favorite = true;
    } else if (view === 'inbox') {
      // For inbox, we can show passwords that were recently added or shared
      whereClause.createdAt = {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      };
    } else if (view === 'trash') {
      whereClause.inTrash = true;
    }

    // Add folder filtering if folderId is provided
    if (folderId) {
      whereClause.folderId = folderId;
    }

    // Add company filtering if companyId is provided
    if (companyId) {
      whereClause.companyId = companyId;
    }

    const passwords = await db.password.findMany({
      where: whereClause,
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
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const transformedPasswords = passwords.map(password => {
      // Расшифровка пароля
      let decryptedPassword = '';
      try {
        if (password.password && password.iv && password.tag) {
          const encryptedData = {
            encrypted: password.password,
            iv: password.iv,
            tag: password.tag
          };
          decryptedPassword = Encryption.decrypt(encryptedData);
        }
      } catch (error) {
        console.error('Error decrypting password:', error);
        decryptedPassword = '[Ошибка расшифровки]';
      }

      return {
        id: password.id,
        title: password.title,
        username: password.username,
        password: decryptedPassword, // Расшифрованный пароль
        url: password.url,
        icon: password.icon,
        favorite: password.favorite,
        inTrash: password.inTrash,
        lastAccessed: password.lastAccessed?.toISOString() || 'Только что',
        company: password.company?.name,
        folder: password.folder?.name,
        folderId: password.folder?.id
      };
    });

    return NextResponse.json(transformedPasswords);
  } catch (error) {
    console.error('Error fetching passwords:', error);
    return NextResponse.json({ error: 'Failed to fetch passwords' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get or create default user safely
    const user = await getOrCreateDefaultUser();

    const { title, username, password, url, notes, icon, favorite, folderId, companyId } = body;

    if (!title || !password) {
      return NextResponse.json({ error: 'Title and password are required' }, { status: 400 });
    }

    // Проверка существования folderId, если он предоставлен и не равен null
    if (folderId && folderId !== "none") {
      const folder = await db.folder.findUnique({
        where: { id: folderId }
      });
      if (!folder) {
        return NextResponse.json({ error: 'Folder not found' }, { status: 400 });
      }
    }

    // Проверка существования companyId, если он предоставлен и не равен null
    if (companyId && companyId !== "none") {
      const company = await db.company.findUnique({
        where: { id: companyId }
      });
      if (!company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 400 });
      }
    }

    // Подготовка данных для создания - преобразуем "none" в null
    const finalFolderId = folderId && folderId !== "none" ? folderId : null;
    const finalCompanyId = companyId && companyId !== "none" ? companyId : null;

    // Шифрование пароля
    let encryptedPassword: string = '';
    let iv: string = '';
    let tag: string = '';
    
    try {
      const encryptedData = Encryption.encrypt(password);
      encryptedPassword = encryptedData.encrypted;
      iv = encryptedData.iv;
      tag = encryptedData.tag;
    } catch (error) {
      console.error('Error encrypting password:', error);
      return NextResponse.json({ error: 'Failed to encrypt password' }, { status: 500 });
    }

    const newPassword = await db.password.create({
      data: {
        title,
        username,
        password: encryptedPassword,
        iv,
        tag,
        url,
        notes,
        icon,
        favorite: favorite || false,
        inTrash: false,
        ownerId: user.id,
        folderId: finalFolderId,
        companyId: finalCompanyId
      },
      include: {
        folder: true,
        company: true
      }
    });

    const transformedPassword = {
      id: newPassword.id,
      title: newPassword.title,
      username: newPassword.username,
      password: password, // Возвращаем оригинальный пароль для отображения
      url: newPassword.url,
      icon: newPassword.icon,
      favorite: newPassword.favorite,
      inTrash: newPassword.inTrash,
      lastAccessed: 'Только что',
      company: newPassword.company?.name,
      folder: newPassword.folder?.name
    };

    return NextResponse.json(transformedPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating password:', error);
    return NextResponse.json({ error: 'Failed to create password' }, { status: 500 });
  }
}