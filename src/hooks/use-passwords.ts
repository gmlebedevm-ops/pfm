"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

export interface Password {
  id: string;
  title: string;
  username?: string;
  password?: string;
  url?: string;
  icon?: string;
  favorite: boolean;
  inTrash?: boolean;
  lastAccessed?: string;
  company?: string;
  folder?: string;
  folderId?: string;
  companyId?: string;
  notes?: string;
  isEncrypted?: boolean;
}

export type ViewType = "all" | "favorites" | "inbox" | "trash" | "folders-management" | "account-management" | "companies-management" | "administration" | "analytics" | "settings" | { type: "folder"; folderId: string; folderName: string } | { type: "company"; companyId: string; companyName: string };

export function usePasswords() {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [currentView, setCurrentViewInternal] = useState<ViewType>("all");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  console.log("usePasswords: Hook initialized with currentView:", currentView);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      refreshPasswords();
    }
  }, [isClient]);

  const refreshPasswords = useCallback(async () => {
    console.log("usePasswords: refreshPasswords called");
    try {
      setLoading(true);
      const response = await apiClient.getPasswords('all');
      if (response.data) {
        setPasswords(response.data);
        console.log("usePasswords: Passwords refreshed:", response.data.length);
      }
    } catch (error) {
      console.error('Error refreshing passwords:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = async (id: string) => {
    try {
      const password = passwords.find(p => p.id === id);
      if (!password) return;

      const response = await apiClient.updatePassword(id, {
        favorite: !password.favorite
      });

      if (response.data) {
        // Обновляем локальное состояние вместо полной перезагрузки
        setPasswords(prev => prev.map(p => p.id === id ? response.data : p));
        toast.success(
          password.favorite 
            ? "Удалено из избранного" 
            : "Добавлено в избранное"
        );
      } else if (response.error) {
        toast.error('Ошибка обновления пароля');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Ошибка обновления пароля');
    }
  };

  const toggleTrash = async (id: string) => {
    try {
      const response = await apiClient.updatePassword(id, {
        inTrash: true
      });

      if (response.data) {
        // Обновляем локальное состояние вместо полной перезагрузки
        setPasswords(prev => prev.map(p => p.id === id ? response.data : p));
        toast.success("Перемещено в корзину");
      } else if (response.error) {
        toast.error('Ошибка перемещения в корзину');
      }
    } catch (error) {
      console.error('Error toggling trash:', error);
      toast.error('Ошибка перемещения в корзину');
    }
  };

  const restore = async (id: string) => {
    try {
      const response = await apiClient.updatePassword(id, {
        inTrash: false
      });

      if (response.data) {
        // Обновляем локальное состояние вместо полной перезагрузки
        setPasswords(prev => prev.map(p => p.id === id ? response.data : p));
        toast.success("Восстановлено из корзины");
      } else if (response.error) {
        toast.error('Ошибка восстановления из корзины');
      }
    } catch (error) {
      console.error('Error restoring password:', error);
      toast.error('Ошибка восстановления из корзины');
    }
  };

  const deletePermanent = async (id: string) => {
    try {
      const response = await apiClient.deletePassword(id);

      if (response.data !== undefined) {
        // Удаляем из локального состояния вместо полной перезагрузки
        setPasswords(prev => prev.filter(p => p.id !== id));
        toast.success("Удалено окончательно");
      } else if (response.error) {
        toast.error('Ошибка удаления пароля');
      }
    } catch (error) {
      console.error('Error deleting password:', error);
      toast.error('Ошибка удаления пароля');
    }
  };

  const restoreAll = async () => {
    try {
      // Get all passwords in trash
      const trashResponse = await apiClient.getPasswords('trash');
      if (trashResponse.data) {
        // Restore each password
        const restorePromises = trashResponse.data.map(password => 
          apiClient.updatePassword(password.id, { inTrash: false })
        );
        
        await Promise.all(restorePromises);
        
        // Обновляем локальное состояние - убираем отметку о корзине у всех паролей
        setPasswords(prev => prev.map(p => ({ ...p, inTrash: false })));
        toast.success("Все пароли восстановлены из корзины");
      }
    } catch (error) {
      console.error('Error restoring all passwords:', error);
      toast.error('Ошибка восстановления всех паролей');
    }
  };

  const emptyTrash = async () => {
    try {
      // Get all passwords in trash
      const trashResponse = await apiClient.getPasswords('trash');
      if (trashResponse.data) {
        // Delete each password
        const deletePromises = trashResponse.data.map(password => 
          apiClient.deletePassword(password.id)
        );
        
        await Promise.all(deletePromises);
        
        // Удаляем все пароли из корзины из локального состояния
        setPasswords(prev => prev.filter(p => !p.inTrash));
        toast.success("Корзина очищена");
      }
    } catch (error) {
      console.error('Error emptying trash:', error);
      toast.error('Ошибка очистки корзины');
    }
  };

  const addPassword = async (password: Omit<Password, 'id'>) => {
    try {
      const response = await apiClient.createPassword(password);

      if (response.data) {
        // Обновляем локальное состояние вместо полной перезагрузки
        setPasswords(prev => [response.data, ...prev]);
        toast.success("Пароль добавлен");
      } else if (response.error) {
        toast.error('Ошибка добавления пароля');
      }
    } catch (error) {
      console.error('Error adding password:', error);
      toast.error('Ошибка добавления пароля');
    }
  };

  const updatePassword = async (id: string, updatedPassword: Partial<Password>) => {
    try {
      const response = await apiClient.updatePassword(id, updatedPassword);

      if (response.data) {
        // Обновляем локальное состояние вместо полной перезагрузки
        setPasswords(prev => prev.map(p => p.id === id ? response.data : p));
        toast.success("Пароль обновлен");
      } else if (response.error) {
        toast.error('Ошибка обновления пароля');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Ошибка обновления пароля');
    }
  };

  const getPasswordsCount = () => {
    return {
      all: passwords.filter(p => !p.inTrash).length,
      favorites: passwords.filter(p => p.favorite && !p.inTrash).length,
      trash: passwords.filter(p => p.inTrash).length
    };
  };

  const setCurrentView = (view: ViewType) => {
    console.log("usePasswords: setCurrentView called with view:", view);
    console.log("usePasswords: Current currentView before change:", currentView);
    setCurrentViewInternal(view);
    console.log("usePasswords: setCurrentViewInternal called");
  };

  return {
    passwords,
    loading,
    currentView,
    setCurrentView,
    toggleFavorite,
    toggleTrash,
    restore,
    deletePermanent,
    restoreAll,
    emptyTrash,
    addPassword,
    updatePassword,
    getPasswordsCount,
    refreshPasswords
  };
}