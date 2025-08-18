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
    return crypto.scryptSync(secret, 'salt', KEY_LENGTH);
  }

  static encrypt(text: string): EncryptionResult {
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
  }

  static decrypt(encryptedData: EncryptionResult): string {
    const key = this.getEncryptionKey();
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAAD(Buffer.from('additional-data', 'utf8'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
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
    const hash = crypto.scryptSync(password, generatedSalt, 64).toString('hex');
    return { hash, salt: generatedSalt };
  }

  // Проверка мастер-пароля
  static verifyMasterPassword(password: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hashMasterPassword(password, salt);
    return computedHash === hash;
  }

  // Проверка готовности шифрования
  static isEncryptionReady(): boolean {
    return !!process.env.ENCRYPTION_SECRET;
  }

  // Шифрование пароля
  static async encryptPassword(password: string): Promise<EncryptionResult> {
    return Promise.resolve(this.encrypt(password));
  }

  // Расшифровка пароля
  static async decryptPassword(encryptedData: EncryptionResult): Promise<string> {
    return Promise.resolve(this.decrypt(encryptedData));
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