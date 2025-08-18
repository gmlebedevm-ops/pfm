import { db } from '@/lib/db';

// Функция для безопасного получения или создания пользователя
// Избегает race conditions при одновременных запросах
export async function getOrCreateDefaultUser() {
  try {
    // Сначала попытаться найти существующего пользователя
    let user = await db.user.findFirst({
      where: {
        email: 'default@example.com'
      }
    });

    if (user) {
      return user;
    }

    // Если пользователь не найден, попытаться создать его
    // Используем транзакцию для безопасности
    try {
      user = await db.user.create({
        data: {
          email: 'default@example.com',
          name: 'Default User',
          role: 'USER'
        }
      });
      return user;
    } catch (createError) {
      // Если ошибка создания (например, пользователь уже создан другим запросом),
      // повторно попытаться найти пользователя
      if (createError.code === 'P2002') {
        // Unique constraint violation
        user = await db.user.findFirst({
          where: {
            email: 'default@example.com'
          }
        });
        if (user) {
          return user;
        }
      }
      // Если пользователь все еще не найден, пробросить ошибку
      throw createError;
    }
  } catch (error) {
    console.error('Error in getOrCreateDefaultUser:', error);
    throw error;
  }
}