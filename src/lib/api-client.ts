const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private userId: string = 'default-user';

  setUserId(userId: string) {
    this.userId = userId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}/api${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': this.userId,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || 'Request failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { error: 'Network error' };
    }
  }

  // Password operations
  async getPasswords(view: 'all' | 'favorites' | 'inbox' | 'trash' = 'all', folderId?: string, companyId?: string) {
    const params = new URLSearchParams({ view });
    if (folderId) {
      params.append('folderId', folderId);
    }
    if (companyId) {
      params.append('companyId', companyId);
    }
    return this.request<any[]>(`/passwords?${params.toString()}`);
  }

  async createPassword(passwordData: any) {
    return this.request<any>('/passwords', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  async getPassword(id: string) {
    return this.request<any>(`/passwords/${id}/full`);
  }

  async updatePassword(id: string, passwordData: any) {
    return this.request<any>(`/passwords/${id}`, {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async deletePassword(id: string) {
    return this.request(`/passwords/${id}`, {
      method: 'DELETE',
    });
  }

  // Folder operations
  async getFolders() {
    return this.request<any[]>('/folders');
  }

  async createFolder(folderData: any) {
    return this.request<any>('/folders', {
      method: 'POST',
      body: JSON.stringify(folderData),
    });
  }

  async updateFolder(id: string, folderData: any) {
    return this.request<any>(`/folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(folderData),
    });
  }

  async deleteFolder(id: string) {
    return this.request(`/folders/${id}`, {
      method: 'DELETE',
    });
  }

  // Company operations
  async getCompanies() {
    return this.request<any[]>('/companies');
  }

  async createCompany(companyData: any) {
    return this.request<any>('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  async updateCompany(id: string, companyData: any) {
    return this.request<any>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companyData),
    });
  }

  async deleteCompany(id: string) {
    return this.request(`/companies/${id}`, {
      method: 'DELETE',
    });
  }

  // Account operations
  async getAccount() {
    // Demo data for account
    return new Promise<ApiResponse<any>>((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            id: '1',
            name: 'Пользователь',
            email: 'user@example.com',
            twoFactorEnabled: false,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            preferences: {
              theme: 'system',
              language: 'ru',
              notifications: {
                email: true,
                push: true,
                security: true
              }
            }
          }
        });
      }, 500);
    });
  }

  async updateAccount(accountData: any) {
    // Demo update account
    return new Promise<ApiResponse<any>>((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            id: '1',
            ...accountData,
            twoFactorEnabled: false,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          }
        });
      }, 500);
    });
  }

  async changePassword(passwordData: any) {
    // Demo change password
    return new Promise<ApiResponse<any>>((resolve) => {
      setTimeout(() => {
        resolve({
          data: { success: true }
        });
      }, 500);
    });
  }

  async toggleTwoFactor(enabled: boolean) {
    // Demo toggle two factor
    return new Promise<ApiResponse<any>>((resolve) => {
      setTimeout(() => {
        resolve({
          data: { twoFactorEnabled: enabled }
        });
      }, 500);
    });
  }

  async getSessions() {
    // Demo sessions data
    return new Promise<ApiResponse<any[]>>((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              id: '1',
              device: 'Chrome on Windows',
              browser: 'Chrome 120',
              location: 'Москва, Россия',
              lastActive: new Date().toISOString(),
              current: true
            },
            {
              id: '2',
              device: 'Safari on iPhone',
              browser: 'Safari 17',
              location: 'Москва, Россия',
              lastActive: new Date(Date.now() - 3600000).toISOString(),
              current: false
            }
          ]
        });
      }, 500);
    });
  }

  async terminateSession(sessionId: string) {
    // Demo terminate session
    return new Promise<ApiResponse<any>>((resolve) => {
      setTimeout(() => {
        resolve({
          data: { success: true }
        });
      }, 500);
    });
  }

  async terminateAllSessions() {
    // Demo terminate all sessions
    return new Promise<ApiResponse<any>>((resolve) => {
      setTimeout(() => {
        resolve({
          data: { success: true }
        });
      }, 500);
    });
  }

  async exportAccountData() {
    // Demo export data
    return new Promise<ApiResponse<any>>((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            passwords: [],
            folders: [],
            companies: [],
            settings: {}
          }
        });
      }, 500);
    });
  }

  async deleteAccount() {
    // Demo delete account
    return new Promise<ApiResponse<any>>((resolve) => {
      setTimeout(() => {
        resolve({
          data: { success: true }
        });
      }, 500);
    });
  }

  // Administration operations
  async getSystemStats() {
    // Demo system stats
    return new Promise<ApiResponse<any>>((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            totalUsers: 42,
            activeUsers: 38,
            totalPasswords: 1247,
            totalCompanies: 8,
            totalFolders: 23,
            systemUptime: '15 дней 4 часа',
            lastBackup: new Date().toISOString(),
            storageUsed: 1024 * 1024 * 1024 * 2.5, // 2.5 GB
            storageTotal: 1024 * 1024 * 1024 * 10 // 10 GB
          }
        });
      }, 500);
    });
  }

  async getUsers() {
    // Demo users data
    return new Promise<ApiResponse<any[]>>((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              id: '1',
              name: 'Александр Иванов',
              email: 'alex@example.com',
              role: 'admin' as const,
              status: 'active' as const,
              lastLogin: new Date().toISOString(),
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              company: 'Технологии Будущего'
            },
            {
              id: '2',
              name: 'Мария Петрова',
              email: 'maria@example.com',
              role: 'user' as const,
              status: 'active' as const,
              lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              company: 'ЭкоСтарт'
            },
            {
              id: '3',
              name: 'Дмитрий Сидоров',
              email: 'dmitry@example.com',
              role: 'user' as const,
              status: 'inactive' as const,
              lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
              company: 'Технологии Будущего'
            },
            {
              id: '4',
              name: 'Елена Козлова',
              email: 'elena@example.com',
              role: 'user' as const,
              status: 'suspended' as const,
              lastLogin: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
              createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        });
      }, 500);
    });
  }

  async getSystemLogs() {
    // Demo system logs
    return new Promise<ApiResponse<any[]>>((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              id: '1',
              timestamp: new Date().toISOString(),
              level: 'info' as const,
              message: 'Пользователь вошел в систему',
              user: 'Александр Иванов',
              action: 'Вход в систему'
            },
            {
              id: '2',
              timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
              level: 'warning' as const,
              message: 'Неудачная попытка входа',
              user: 'Неизвестный',
              action: 'Ошибка аутентификации'
            },
            {
              id: '3',
              timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              level: 'info' as const,
              message: 'Создан новый пароль',
              user: 'Мария Петрова',
              action: 'Создание пароля'
            },
            {
              id: '4',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              level: 'error' as const,
              message: 'Ошибка синхронизации данных',
              user: 'Система',
              action: 'Ошибка системы'
            },
            {
              id: '5',
              timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
              level: 'info' as const,
              message: 'Резервная копия создана успешно',
              user: 'Система',
              action: 'Резервное копирование'
            }
          ]
        });
      }, 500);
    });
  }

  async updateSystemSettings(settings: any) {
    // Demo update system settings
    return new Promise<ApiResponse<any>>((resolve) => {
      setTimeout(() => {
        resolve({
          data: { success: true, settings }
        });
      }, 500);
    });
  }

  async updateUserStatus(userId: string, status: string) {
    // Demo update user status
    return new Promise<ApiResponse<any>>((resolve) => {
      setTimeout(() => {
        resolve({
          data: { success: true, userId, status }
        });
      }, 500);
    });
  }

  async deleteUser(userId: string) {
    // Demo delete user
    return new Promise<ApiResponse<any>>((resolve) => {
      setTimeout(() => {
        resolve({
          data: { success: true }
        });
      }, 500);
    });
  }

  async createBackup() {
    // Demo create backup
    return new Promise<ApiResponse<any>>((resolve) => {
      setTimeout(() => {
        resolve({
          data: { 
            success: true, 
            backupId: Date.now().toString(),
            timestamp: new Date().toISOString()
          }
        });
      }, 500);
    });
  }
}

export const apiClient = new ApiClient();