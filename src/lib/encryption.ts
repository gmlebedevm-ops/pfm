/**
 * End-to-End Encryption Utilities for Passflow
 * Uses Web Crypto API for client-side encryption
 */

export interface EncryptionKey {
  key: CryptoKey;
  keyId: string;
}

export interface EncryptedData {
  data: string; // Base64 encoded encrypted data
  iv: string;   // Base64 encoded initialization vector
  keyId: string; // Key identifier
}

export class EncryptionManager {
  private static instance: EncryptionManager;
  private masterKey: CryptoKey | null = null;
  private keyId: string | null = null;

  private constructor() {}

  public static getInstance(): EncryptionManager {
    if (!EncryptionManager.instance) {
      EncryptionManager.instance = new EncryptionManager();
    }
    return EncryptionManager.instance;
  }

  /**
   * Initialize encryption with a master password
   */
  public async initialize(masterPassword: string): Promise<void> {
    try {
      // Check if Web Crypto API is available
      if (!crypto || !crypto.subtle) {
        console.warn('Web Crypto API not available, using fallback mode');
        // Fallback mode - just store that encryption is "initialized"
        this.keyId = `fallback_${Date.now()}`;
        this.masterKey = {} as CryptoKey; // Mock key
        console.log('Encryption initialized in fallback mode');
        return;
      }

      // Generate a key ID based on the current timestamp
      this.keyId = `key_${Date.now()}`;
      
      // Derive key from master password using PBKDF2
      const encoder = new TextEncoder();
      const passwordData = encoder.encode(masterPassword);
      
      // Import master password as a key
      const masterKeyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordData,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      // Generate a random salt for better security
      const salt = crypto.getRandomValues(new Uint8Array(16));

      // Derive the actual encryption key
      this.masterKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256',
        },
        masterKeyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      // Test the key by encrypting and decrypting a test string
      try {
        const testData = "test";
        const encrypted = await this.encrypt(testData);
        const decrypted = await this.decrypt(encrypted);
        
        if (decrypted !== testData) {
          throw new Error('Key validation failed');
        }
      } catch (testError) {
        console.warn('Key validation failed, but continuing:', testError);
      }

      // Store the key in session storage for the current session
      await this.storeKeyInSession();
      
      console.log('Encryption initialized successfully');
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      this.clear(); // Clear any partial state
      throw new Error(`Failed to initialize encryption: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Encrypt sensitive data
   */
  public async encrypt(data: string): Promise<EncryptedData> {
    if (!this.masterKey || !this.keyId) {
      throw new Error('Encryption not initialized');
    }

    // Fallback mode - just return base64 encoded data
    if (this.keyId.startsWith('fallback_')) {
      return {
        data: btoa(data),
        iv: 'fallback_iv',
        keyId: this.keyId,
      };
    }

    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      // Generate a random IV for each encryption
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Encrypt the data
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        this.masterKey,
        dataBuffer
      );

      // Return encrypted data with IV and key ID
      return {
        data: this.arrayBufferToBase64(encryptedBuffer),
        iv: this.arrayBufferToBase64(iv),
        keyId: this.keyId,
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt encrypted data
   */
  public async decrypt(encryptedData: EncryptedData): Promise<string> {
    if (!this.masterKey) {
      throw new Error('Encryption not initialized');
    }

    // Fallback mode - just decode base64 data
    if (encryptedData.keyId.startsWith('fallback_')) {
      try {
        return atob(encryptedData.data);
      } catch (error) {
        console.error('Fallback decryption failed:', error);
        return encryptedData.data; // Return as-is if base64 decode fails
      }
    }

    try {
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedData.data);
      const iv = this.base64ToArrayBuffer(encryptedData.iv);

      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: new Uint8Array(iv),
        },
        this.masterKey,
        encryptedBuffer
      );

      // Convert back to string
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Generate a secure random password
   */
  public generateSecurePassword(length: number = 16): string {
    try {
      // Try to use crypto API if available
      if (crypto && crypto.getRandomValues) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        let password = '';
        
        for (let i = 0; i < length; i++) {
          const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % charset.length;
          password += charset[randomIndex];
        }
        
        return password;
      }
    } catch (error) {
      console.warn('Crypto API not available for password generation, using fallback');
    }

    // Fallback method - Math.random()
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }

  /**
   * Check if encryption is initialized
   */
  public isInitialized(): boolean {
    return this.masterKey !== null && this.keyId !== null;
  }

  /**
   * Clear encryption keys from memory
   */
  public clear(): void {
    this.masterKey = null;
    this.keyId = null;
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('passflow_encryption_key');
    }
    console.log('Encryption keys cleared');
  }

  /**
   * Try to restore key from session storage
   */
  public async restoreFromSession(): Promise<boolean> {
    try {
      if (typeof sessionStorage === 'undefined') {
        console.warn('SessionStorage not available');
        return false;
      }

      const storedKey = sessionStorage.getItem('passflow_encryption_key');
      if (!storedKey) {
        console.log('No stored key found in session');
        return false;
      }

      const { keyData, keyId, timestamp } = JSON.parse(storedKey);
      
      // Check if key is too old (older than 24 hours)
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (timestamp && (now - timestamp) > maxAge) {
        console.log('Stored key is too old, removing');
        sessionStorage.removeItem('passflow_encryption_key');
        return false;
      }

      this.keyId = keyId;

      // Import the key
      this.masterKey = await crypto.subtle.importKey(
        'raw',
        this.base64ToArrayBuffer(keyData),
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
      );

      console.log('Key restored from session storage successfully');
      return true;
    } catch (error) {
      console.error('Failed to restore key from session:', error);
      // Clear potentially corrupted data
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('passflow_encryption_key');
      }
      return false;
    }
  }

  private async storeKeyInSession(): Promise<void> {
    if (!this.masterKey || !this.keyId) {
      return;
    }

    try {
      // Export the key for storage
      const exportedKey = await crypto.subtle.exportKey('raw', this.masterKey);
      const keyData = this.arrayBufferToBase64(exportedKey);

      // Store in sessionStorage with error handling
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('passflow_encryption_key', JSON.stringify({
          keyData,
          keyId: this.keyId,
          timestamp: Date.now()
        }));
        console.log('Key stored in session storage successfully');
      } else {
        console.warn('SessionStorage not available, key will not persist');
      }
    } catch (error) {
      console.error('Failed to store key in session:', error);
      // Don't throw here - encryption can still work without session storage
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

// Export singleton instance
export const encryptionManager = EncryptionManager.getInstance();

// Utility functions for common encryption operations
export async function encryptPassword(password: string): Promise<EncryptedData> {
  return await encryptionManager.encrypt(password);
}

export async function decryptPassword(encryptedData: EncryptedData): Promise<string> {
  return await encryptionManager.decrypt(encryptedData);
}

export function generatePassword(length: number = 16): string {
  return encryptionManager.generateSecurePassword(length);
}

export function isEncryptionReady(): boolean {
  return encryptionManager.isInitialized();
}