"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Shield, 
  Key, 
  Bell, 
  Monitor,
  Smartphone,
  Palette,
  Save,
  X,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Download,
  Upload
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface AccountData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  lastLogin: string;
  preferences: {
    theme: "light" | "dark" | "system";
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      security: boolean;
    };
  };
}

interface SessionData {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  current: boolean;
}

interface AccountManagementProps {
  onClose?: () => void;
}

export function AccountManagement({ onClose }: AccountManagementProps) {
  const [account, setAccount] = useState<AccountData | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [editMode, setEditMode] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    theme: "system" as const,
    language: "ru",
    notifications: {
      email: true,
      push: true,
      security: true
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Загрузка данных аккаунта
  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    try {
      setLoading(true);
      
      // Загрузка информации об аккаунте
      const accountResponse = await apiClient.getAccount();
      if (accountResponse.data) {
        setAccount(accountResponse.data);
        setEditForm({
          name: accountResponse.data.name,
          email: accountResponse.data.email,
          theme: accountResponse.data.preferences.theme,
          language: accountResponse.data.preferences.language,
          notifications: accountResponse.data.preferences.notifications
        });
      }

      // Загрузка активных сессий
      const sessionsResponse = await apiClient.getSessions();
      if (sessionsResponse.data) {
        setSessions(sessionsResponse.data);
      }
    } catch (error) {
      console.error('Error loading account data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAccount = async () => {
    if (!account) return;

    setSaveStatus("saving");
    try {
      const response = await apiClient.updateAccount({
        name: editForm.name,
        email: editForm.email,
        preferences: {
          theme: editForm.theme,
          language: editForm.language,
          notifications: editForm.notifications
        }
      });
      
      if (response.data) {
        setSaveStatus("success");
        await loadAccountData();
        setEditMode(false);
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    } catch (error) {
      console.error('Error updating account:', error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Новые пароли не совпадают");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      alert("Пароль должен содержать минимум 8 символов");
      return;
    }

    try {
      const response = await apiClient.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      if (response.data) {
        setShowPasswordDialog(false);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        alert("Пароль успешно изменен");
      } else {
        alert("Ошибка при изменении пароля");
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert("Ошибка при изменении пароля");
    }
  };

  const handleToggleTwoFactor = async () => {
    if (!account) return;

    try {
      const response = await apiClient.toggleTwoFactor(!account.twoFactorEnabled);
      
      if (response.data) {
        await loadAccountData();
        setShowTwoFactorDialog(false);
        alert(account.twoFactorEnabled ? "Двухфакторная аутентификация отключена" : "Двухфакторная аутентификация включена");
      }
    } catch (error) {
      console.error('Error toggling two factor:', error);
      alert("Ошибка при изменении настроек двухфакторной аутентификации");
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    if (!confirm("Завершить эту сессию?")) return;

    try {
      const response = await apiClient.terminateSession(sessionId);
      
      if (response.data) {
        await loadAccountData();
      }
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  };

  const handleTerminateAllSessions = async () => {
    if (!confirm("Завершить все сессии кроме текущей?")) return;

    try {
      const response = await apiClient.terminateAllSessions();
      
      if (response.data) {
        await loadAccountData();
      }
    } catch (error) {
      console.error('Error terminating all sessions:', error);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await apiClient.exportAccountData();
      
      if (response.data) {
        // Создание и скачивание файла
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `account-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert("Ошибка при экспорте данных");
    }
  };

  const handleDeleteAccount = async () => {
    if (!account) return;

    if (!confirm(`Вы уверены, что хотите удалить аккаунт "${account.email}"? Это действие необратимо.`)) {
      return;
    }

    try {
      const response = await apiClient.deleteAccount();
      
      if (response.data) {
        alert("Аккаунт успешно удален");
        // Перенаправление на страницу входа или выхода из системы
        window.location.href = "/login";
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert("Ошибка при удалении аккаунта");
    }
  };

  // Состояние загрузки для серверного рендеринга
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ранний возврат для серверного рендеринга
  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Управление аккаунтом</h1>
            <p className="text-muted-foreground">Настройки профиля и безопасности</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="bg-muted rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-muted-foreground/20 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="h-4 bg-muted-foreground/20 rounded w-full"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Управление аккаунтом</h1>
            <p className="text-muted-foreground">Настройки профиля и безопасности</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка данных аккаунта...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Управление аккаунтом</h1>
            <p className="text-muted-foreground">Настройки профиля и безопасности</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Не удалось загрузить данные аккаунта. Пожалуйста, попробуйте обновить страницу.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Управление аккаунтом</h1>
          <p className="text-muted-foreground">Настройки профиля и безопасности</p>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                <X className="h-4 w-4 mr-2" />
                Отмена
              </Button>
              <Button onClick={handleSaveAccount} disabled={saveStatus === "saving"}>
                <Save className="h-4 w-4 mr-2" />
                {saveStatus === "saving" ? "Сохранение..." : "Сохранить"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Редактировать
            </Button>
          )}
        </div>
      </div>

      {/* Статус сохранения */}
      {saveStatus === "success" && (
        <Alert className="mt-2">
          <AlertDescription className="text-green-600">
            Данные аккаунта успешно обновлены
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === "error" && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>
            Произошла ошибка при обновлении данных аккаунта
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
          <TabsTrigger value="sessions">Сессии</TabsTrigger>
          <TabsTrigger value="data">Данные</TabsTrigger>
        </TabsList>

        {/* Вкладка профиля */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Основная информация
                </CardTitle>
                <CardDescription>
                  Управление основными данными вашего аккаунта
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  {editMode ? (
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded-md">{account.name}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {editMode ? (
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded-md">{account.email}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Дата регистрации</Label>
                  <div className="p-2 bg-muted rounded-md">
                    {new Date(account.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Последний вход</Label>
                  <div className="p-2 bg-muted rounded-md">
                    {account.lastLogin ? new Date(account.lastLogin).toLocaleString('ru-RU') : 'Неизвестно'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Персонализация
                </CardTitle>
                <CardDescription>
                  Настройте внешний вид и язык интерфейса
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Тема</Label>
                  {editMode ? (
                    <div className="flex gap-2">
                      {[
                        { value: "light", label: "Светлая" },
                        { value: "dark", label: "Темная" },
                        { value: "system", label: "Системная" }
                      ].map((theme) => (
                        <Button
                          key={theme.value}
                          variant={editForm.theme === theme.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setEditForm({...editForm, theme: theme.value as any})}
                        >
                          {theme.label}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2 bg-muted rounded-md">
                      {editForm.theme === "light" ? "Светлая" : 
                       editForm.theme === "dark" ? "Темная" : "Системная"}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Язык</Label>
                  {editMode ? (
                    <select
                      value={editForm.language}
                      onChange={(e) => setEditForm({...editForm, language: e.target.value})}
                      className="w-full p-2 border border-border rounded-md"
                    >
                      <option value="ru">Русский</option>
                      <option value="en">English</option>
                    </select>
                  ) : (
                    <div className="p-2 bg-muted rounded-md">
                      {editForm.language === "ru" ? "Русский" : "English"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Уведомления
              </CardTitle>
              <CardDescription>
                Управление настройками уведомлений
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email уведомления</Label>
                  <p className="text-sm text-muted-foreground">Получать уведомления по email</p>
                </div>
                {editMode ? (
                  <input
                    type="checkbox"
                    checked={editForm.notifications.email}
                    onChange={(e) => setEditForm({
                      ...editForm, 
                      notifications: {...editForm.notifications, email: e.target.checked}
                    })}
                    className="h-4 w-4"
                  />
                ) : (
                  <Badge variant={editForm.notifications.email ? "default" : "secondary"}>
                    {editForm.notifications.email ? "Включены" : "Выключены"}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push уведомления</Label>
                  <p className="text-sm text-muted-foreground">Push уведомления в браузере</p>
                </div>
                {editMode ? (
                  <input
                    type="checkbox"
                    checked={editForm.notifications.push}
                    onChange={(e) => setEditForm({
                      ...editForm, 
                      notifications: {...editForm.notifications, push: e.target.checked}
                    })}
                    className="h-4 w-4"
                  />
                ) : (
                  <Badge variant={editForm.notifications.push ? "default" : "secondary"}>
                    {editForm.notifications.push ? "Включены" : "Выключены"}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Уведомления безопасности</Label>
                  <p className="text-sm text-muted-foreground">Важные события безопасности</p>
                </div>
                {editMode ? (
                  <input
                    type="checkbox"
                    checked={editForm.notifications.security}
                    onChange={(e) => setEditForm({
                      ...editForm, 
                      notifications: {...editForm.notifications, security: e.target.checked}
                    })}
                    className="h-4 w-4"
                  />
                ) : (
                  <Badge variant={editForm.notifications.security ? "default" : "secondary"}>
                    {editForm.notifications.security ? "Включены" : "Выключены"}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка безопасности */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Пароль
                </CardTitle>
                <CardDescription>
                  Управление паролем аккаунта
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Пароль</Label>
                    <p className="text-sm text-muted-foreground">Последнее изменение: неизвестно</p>
                  </div>
                  <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Изменить
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Изменение пароля</DialogTitle>
                        <DialogDescription>
                          Введите текущий пароль и новый пароль для изменения
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Текущий пароль</Label>
                          <div className="relative">
                            <Input
                              id="current-password"
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2"
                              onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                            >
                              {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">Новый пароль</Label>
                          <div className="relative">
                            <Input
                              id="new-password"
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2"
                              onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                            >
                              {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Подтвердите новый пароль</Label>
                          <div className="relative">
                            <Input
                              id="confirm-password"
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2"
                              onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                            >
                              {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                          Отмена
                        </Button>
                        <Button onClick={handleChangePassword}>
                          Изменить пароль
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Двухфакторная аутентификация
                </CardTitle>
                <CardDescription>
                  Дополнительный уровень безопасности для вашего аккаунта
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Статус 2FA</Label>
                    <p className="text-sm text-muted-foreground">
                      {account.twoFactorEnabled ? "Включена" : "Выключена"}
                    </p>
                  </div>
                  <Badge variant={account.twoFactorEnabled ? "default" : "secondary"}>
                    {account.twoFactorEnabled ? "Активна" : "Неактивна"}
                  </Badge>
                </div>
                <Dialog open={showTwoFactorDialog} onOpenChange={setShowTwoFactorDialog}>
                  <DialogTrigger asChild>
                    <Button variant={account.twoFactorEnabled ? "destructive" : "default"}>
                      {account.twoFactorEnabled ? "Отключить 2FA" : "Включить 2FA"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {account.twoFactorEnabled ? "Отключение 2FA" : "Включение 2FA"}
                      </DialogTitle>
                      <DialogDescription>
                        {account.twoFactorEnabled 
                          ? "Вы уверены, что хотите отключить двухфакторную аутентификацию? Это сделает ваш аккаунт менее безопасным."
                          : "Включение двухфакторной аутентификации сделает ваш аккаунт более безопасным."
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowTwoFactorDialog(false)}>
                        Отмена
                      </Button>
                      <Button onClick={handleToggleTwoFactor}>
                        {account.twoFactorEnabled ? "Отключить" : "Включить"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Вкладка сессий */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Активные сессии
              </CardTitle>
              <CardDescription>
                Управление активными сессиями вашего аккаунта
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Активных сессий: {sessions.length}
                </p>
                <Button variant="outline" onClick={handleTerminateAllSessions}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Завершить все кроме текущей
                </Button>
              </div>
              
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-md">
                        {session.device.includes('Mobile') ? (
                          <Smartphone className="h-4 w-4" />
                        ) : (
                          <Monitor className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{session.device}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.browser} • {session.location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Последняя активность: {new Date(session.lastActive).toLocaleString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.current && (
                        <Badge variant="outline">Текущая</Badge>
                      )}
                      {!session.current && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTerminateSession(session.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка данных */}
        <TabsContent value="data" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Экспорт данных
                </CardTitle>
                <CardDescription>
                  Скачайте все данные, связанные с вашим аккаунтом
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Вы можете экспортировать все свои данные, включая пароли, папки и настройки аккаунта.
                </p>
                <Button onClick={handleExportData} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Экспортировать данные
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Удаление аккаунта
                </CardTitle>
                <CardDescription>
                  Безвозвратное удаление аккаунта и всех данных
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Внимание! Удаление аккаунта необратимо. Все ваши данные будут удалены без возможности восстановления.
                </p>
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Удалить аккаунт
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Удаление аккаунта</DialogTitle>
                      <DialogDescription>
                        Вы уверены, что хотите удалить аккаунт "{account.email}"? 
                        Это действие невозможно отменить. Все данные будут безвозвратно удалены.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                        Отмена
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteAccount}>
                        Удалить аккаунт
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}