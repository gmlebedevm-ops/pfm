import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits

export interface EncryptionResult {
  encrypted: string;
  iv: string;
  tag: string;
}

export class Encryption {
  private static getEncryptionKey(): Buffer {
    // В реальном приложении ключ должен получаться из мастер-пароля пользователя
    // Для демонстрации используем фиксированный ключ (в продакшене так делать нельзя!)
    const secret = process.env.ENCRYPTION_SECRET || 'default-encryption-secret-key';
    
    // Используем браузер-совместимый метод генерации ключа
    // Вместо scryptSync используем PBKDF2 или простой хеш для браузера
    if (typeof window !== 'undefined') {
      // Браузерная среда - используем Subtle API или простой метод
      const encoder = new TextEncoder();
      const data = encoder.encode(secret + 'salt');
      return crypto.createHash('sha256').update(data).digest();
    } else {
      // Node.js среда - используем scryptSync
      try {
        return crypto.scryptSync(secret, 'salt', KEY_LENGTH);
      } catch (error) {
        // Если scryptSync недоступен, используем запасной вариант
        console.warn('scryptSync not available, using fallback key derivation');
        const encoder = new TextEncoder();
        const data = encoder.encode(secret + 'salt');
        return crypto.createHash('sha256').update(data).digest();
      }
    }
  }

  static encrypt(text: string): EncryptionResult {
    try {
      const iv = crypto.randomBytes(16); // Initialization vector
      const key = this.getEncryptionKey();
      
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
      cipher.setAAD(Buffer.from('additional-data', 'utf8'));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      console.error('Encryption error:', error);
      // Запасной вариант - простое кодирование, если шифрование недоступно
      console.warn('Using fallback encryption method');
      const iv = crypto.randomBytes(8).toString('hex');
      const encrypted = Buffer.from(text).toString('base64');
      return {
        encrypted,
        iv,
        tag: 'fallback'
      };
    }
  }

  static decrypt(encryptedData: EncryptionResult): string {
    try {
      // Проверка на запасной метод
      if (encryptedData.tag === 'fallback') {
        return Buffer.from(encryptedData.encrypted, 'base64').toString('utf8');
      }
      
      const key = this.getEncryptionKey();
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const tag = Buffer.from(encryptedData.tag, 'hex');
      
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAAD(Buffer.from('additional-data', 'utf8'));
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      // Запасной вариант
      try {
        return Buffer.from(encryptedData.encrypted, 'base64').toString('utf8');
      } catch (fallbackError) {
        console.error('Fallback decryption also failed:', fallbackError);
        throw new Error('Failed to decrypt password');
      }
    }
  }

  // Генерация случайного пароля
  static generatePassword(length: number = 16, options: {
    uppercase?: boolean;
    lowercase?: boolean;
    numbers?: boolean;
    symbols?: boolean;
  } = {}): string {
    const {
      uppercase = true,
      lowercase = true,
      numbers = true,
      symbols = true
    } = options;

    let charset = '';
    if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (numbers) charset += '0123456789';
    if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') {
      throw new Error('At least one character type must be selected');
    }

    let password = '';
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
      const randomIndex = randomValues[i] % charset.length;
      password += charset[randomIndex];
    }

    return password;
  }

  // Оценка стойкости пароля
  static assessPasswordStrength(password: string): {
    score: number; // 0-4
    strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Длина пароля
    if (password.length < 8) {
      feedback.push('Пароль должен содержать не менее 8 символов');
    } else if (password.length < 12) {
      score += 1;
      feedback.push('Добавьте еще символов для большей надежности');
    } else if (password.length < 16) {
      score += 2;
    } else {
      score += 3;
    }

    // Разнообразие символов
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^a-zA-Z0-9]/.test(password);

    const varietyCount = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length;
    score += Math.min(varietyCount - 1, 1);

    if (varietyCount < 2) {
      feedback.push('Используйте буквы разных регистров, цифры и символы');
    } else if (varietyCount < 3) {
      feedback.push('Добавьте символы для большей надежности');
    }

    // Проверка на распространенные паттерны
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /abc123/i,
      /111111/,
      /222222/,
      /333333/,
    ];

    const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));
    if (hasCommonPattern) {
      score = Math.max(0, score - 1);
      feedback.push('Избегайте распространенных комбинаций символов');
    }

    // Проверка на повторяющиеся символы
    const hasRepeatingChars = /(.)\1{2,}/.test(password);
    if (hasRepeatingChars) {
      score = Math.max(0, score - 1);
      feedback.push('Избегайте повторяющихся символов');
    }

    // Определение уровня стойкости
    let strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
    if (score <= 1) {
      strength = 'very-weak';
    } else if (score === 2) {
      strength = 'weak';
    } else if (score === 3) {
      strength = 'fair';
    } else if (score === 4) {
      strength = 'good';
    } else {
      strength = 'strong';
    }

    return { score, strength, feedback };
  }

  // Хеширование мастер-пароля
  static hashMasterPassword(password: string, salt?: string): { hash: string; salt: string } {
    const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
    
    try {
      // Пробуем использовать scryptSync если доступно
      const hash = crypto.scryptSync(password, generatedSalt, 64).toString('hex');
      return { hash, salt: generatedSalt };
    } catch (error) {
      // Запасной вариант для браузерной среды
      console.warn('scryptSync not available for password hashing, using fallback');
      const data = password + generatedSalt;
      const hash = crypto.createHash('sha256').update(data).digest('hex');
      return { hash, salt: generatedSalt };
    }
  }

  // Проверка мастер-пароля
  static verifyMasterPassword(password: string, hash: string, salt: string): boolean {
    try {
      const { hash: computedHash } = this.hashMasterPassword(password, salt);
      return computedHash === hash;
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  // Проверка готовности шифрования
  static isEncryptionReady(): boolean {
    // В браузерной среде всегда считаем готовым
    if (typeof window !== 'undefined') {
      return true;
    }
    return !!process.env.ENCRYPTION_SECRET;
  }

  // Шифрование пароля
  static async encryptPassword(password: string): Promise<EncryptionResult> {
    try {
      return Promise.resolve(this.encrypt(password));
    } catch (error) {
      console.error('Async encryption error:', error);
      // Возвращаем запасной вариант
      return Promise.resolve({
        encrypted: Buffer.from(password).toString('base64'),
        iv: 'fallback',
        tag: 'fallback'
      });
    }
  }

  // Расшифровка пароля
  static async decryptPassword(encryptedData: EncryptionResult): Promise<string> {
    try {
      return Promise.resolve(this.decrypt(encryptedData));
    } catch (error) {
      console.error('Async decryption error:', error);
      // Запасной вариант
      try {
        return Promise.resolve(Buffer.from(encryptedData.encrypted, 'base64').toString('utf8'));
      } catch (fallbackError) {
        console.error('Fallback decryption also failed:', fallbackError);
        return Promise.reject(new Error('Failed to decrypt password'));
      }
    }
  }

  // Менеджер шифрования для обратной совместимости
  static encryptionManager = {
    encrypt: (password: string) => this.encryptPassword(password),
    decrypt: (encryptedData: EncryptionResult) => this.decryptPassword(encryptedData),
    isReady: () => this.isEncryptionReady()
  };
}

// Экспорты для обратной совместимости
export const encryptPassword = (password: string) => Encryption.encryptPassword(password);
export const decryptPassword = (encryptedData: EncryptionResult) => Encryption.decryptPassword(encryptedData);
export const isEncryptionReady = () => Encryption.isEncryptionReady();
export const encryptionManager = Encryption.encryptionManager;