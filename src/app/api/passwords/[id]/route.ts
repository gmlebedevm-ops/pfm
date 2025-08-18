import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/user-utils';
import { Encryption } from '@/lib/encryption';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const passwordId = params.id;
    
    // Get or create default user
    const user = await getOrCreateDefaultUser();

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

    // Подготовка данных для обновления
    const updateData: any = {
      ...(title && { title }),
      ...(username !== undefined && { username }),
      ...(url !== undefined && { url }),
      ...(notes !== undefined && { notes }),
      ...(icon !== undefined && { icon }),
      ...(favorite !== undefined && { favorite }),
      ...(inTrash !== undefined && { inTrash }),
      ...(folderId !== undefined && { folderId }),
      ...(companyId !== undefined && { companyId })
    };

    // Если пароль предоставлен, шифруем его
    if (password) {
      try {
        const encryptedData = Encryption.encrypt(password);
        updateData.password = encryptedData.encrypted;
        updateData.iv = encryptedData.iv;
        updateData.tag = encryptedData.tag;
      } catch (error) {
        console.error('Error encrypting password:', error);
        return NextResponse.json({ error: 'Failed to encrypt password' }, { status: 500 });
      }
    }

    const updatedPassword = await db.password.update({
      where: { id: passwordId },
      data: updateData,
      include: {
        folder: true,
        company: true
      }
    });

    // Расшифровка пароля для возврата
    let decryptedPassword = '';
    if (updatedPassword.password && updatedPassword.iv && updatedPassword.tag) {
      try {
        const encryptedData = {
          encrypted: updatedPassword.password,
          iv: updatedPassword.iv,
          tag: updatedPassword.tag
        };
        decryptedPassword = Encryption.decrypt(encryptedData);
      } catch (error) {
        console.error('Error decrypting password:', error);
        decryptedPassword = '[Ошибка расшифровки]';
      }
    }

    const transformedPassword = {
      id: updatedPassword.id,
      title: updatedPassword.title,
      username: updatedPassword.username,
      password: decryptedPassword || password, // Возвращаем расшифрованный или оригинальный пароль
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
    const user = await getOrCreateDefaultUser();

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