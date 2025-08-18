"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  Users, 
  Settings, 
  Database, 
  Activity,
  BarChart3,
  Bell,
  Key,
  Lock,
  Unlock,
  Trash2,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Server,
  HardDrive,
  Wifi,
  WifiOff,
  UserPlus,
  UserMinus,
  Mail,
  Phone,
  MapPin,
  Globe,
  Building2,
  Folder,
  Download,
  Upload,
  RefreshCw
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalPasswords: number;
  totalCompanies: number;
  totalFolders: number;
  systemUptime: string;
  lastBackup: string;
  storageUsed: number;
  storageTotal: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "inactive" | "suspended";
  lastLogin: string;
  createdAt: string;
  company?: string;
}

interface SystemLog {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error";
  message: string;
  user?: string;
  action: string;
}

interface AdministrationManagementProps {
  onClose?: () => void;
}

export function AdministrationManagement({ onClose }: AdministrationManagementProps) {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  
  // Состояния для настроек системы
  const [systemSettings, setSystemSettings] = useState({
    allowUserRegistration: true,
    requireEmailVerification: true,
    maxPasswordsPerUser: 1000,
    sessionTimeout: 30,
    enableTwoFactorAuth: true,
    enableBackup: true,
    backupFrequency: "daily",
    retentionPeriod: 90,
    enableNotifications: true,
    maintenanceMode: false
  });

  // Загрузка данных
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Загрузка статистики системы
      const statsResponse = await apiClient.getSystemStats();
      if (statsResponse.data) {
        setSystemStats(statsResponse.data);
      }

      // Загрузка пользователей
      const usersResponse = await apiClient.getUsers();
      if (usersResponse.data) {
        setUsers(usersResponse.data);
      }

      // Загрузка логов системы
      const logsResponse = await apiClient.getSystemLogs();
      if (logsResponse.data) {
        setLogs(logsResponse.data);
      }
    } catch (error) {
      console.error('Error loading administration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaveStatus("saving");
    try {
      const response = await apiClient.updateSystemSettings(systemSettings);
      
      if (response.data) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    } catch (error) {
      console.error('Error saving system settings:', error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const response = await apiClient.updateUserStatus(userId, newStatus);
      
      if (response.data) {
        await loadData();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) return;

    try {
      const response = await apiClient.deleteUser(userId);
      
      if (response.data !== undefined) {
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleCreateBackup = async () => {
    try {
      const response = await apiClient.createBackup();
      
      if (response.data) {
        await loadData();
      }
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  // Состояние загрузки для серверного рендеринга
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Администрирование</h1>
            <p className="text-muted-foreground">Управление системой и пользователями</p>
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-muted rounded-md w-24"></div>
            <div className="h-10 bg-muted rounded-md w-24"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="bg-muted rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-muted-foreground/20 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Администрирование</h1>
          <p className="text-muted-foreground">Управление системой и пользователями</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
          <Button onClick={handleCreateBackup}>
            <Download className="h-4 w-4 mr-2" />
            Создать резервную копию
          </Button>
        </div>
      </div>

      {/* Статус сохранения */}
      {saveStatus === "success" && (
        <Alert className="mt-2">
          <AlertDescription className="text-green-600">
            Настройки успешно сохранены
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === "error" && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>
            Произошла ошибка при сохранении настроек
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
          <TabsTrigger value="logs">Логи</TabsTrigger>
        </TabsList>

        {/* Вкладка Обзор */}
        <TabsContent value="overview" className="space-y-6">
          {/* Статистика системы */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {systemStats?.activeUsers || 0} активных
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего паролей</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.totalPasswords || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Защищенных записей
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Предприятия</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.totalCompanies || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {systemStats?.totalFolders || 0} папок
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Система</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemStats?.systemUptime || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Время работы
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Дополнительная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Хранилище
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Использовано:</span>
                    <span>{formatBytes(systemStats?.storageUsed || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Всего:</span>
                    <span>{formatBytes(systemStats?.storageTotal || 0)}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ 
                        width: `${((systemStats?.storageUsed || 0) / (systemStats?.storageTotal || 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Резервные копии
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Последняя копия:</span>
                    <span>{systemStats?.lastBackup ? formatDate(systemStats.lastBackup) : 'Нет'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Статус:</span>
                    <Badge variant="outline" className="text-green-600">
                      Активно
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Вкладка Пользователи */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Управление пользователями</CardTitle>
              <CardDescription>
                Просмотр и управление всеми пользователями системы
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                            {user.role === "admin" ? "Администратор" : "Пользователь"}
                          </Badge>
                          <Badge variant={user.status === "active" ? "default" : "destructive"}>
                            {user.status === "active" ? "Активен" : user.status === "inactive" ? "Неактивен" : "Заблокирован"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm text-muted-foreground">
                        <div>Последний вход: {user.lastLogin ? formatDate(user.lastLogin) : 'Никогда'}</div>
                        <div>Создан: {formatDate(user.createdAt)}</div>
                      </div>
                      <Switch
                        checked={user.status === "active"}
                        onCheckedChange={() => handleToggleUserStatus(user.id, user.status)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка Настройки */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Системные настройки</CardTitle>
              <CardDescription>
                Конфигурация параметров системы
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Безопасность</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Регистрация пользователей</Label>
                      <p className="text-sm text-muted-foreground">
                        Разрешить новым пользователям регистрироваться
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.allowUserRegistration}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, allowUserRegistration: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Подтверждение email</Label>
                      <p className="text-sm text-muted-foreground">
                        Требовать подтверждение email адреса
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.requireEmailVerification}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, requireEmailVerification: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Двухфакторная аутентификация</Label>
                      <p className="text-sm text-muted-foreground">
                        Включить 2FA для всех пользователей
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.enableTwoFactorAuth}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, enableTwoFactorAuth: checked }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Максимальное количество паролей на пользователя</Label>
                    <Input
                      type="number"
                      value={systemSettings.maxPasswordsPerUser}
                      onChange={(e) => 
                        setSystemSettings(prev => ({ 
                          ...prev, 
                          maxPasswordsPerUser: parseInt(e.target.value) 
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Система</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Режим обслуживания</Label>
                      <p className="text-sm text-muted-foreground">
                        Отключить систему для пользователей
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Резервное копирование</Label>
                      <p className="text-sm text-muted-foreground">
                        Автоматическое создание резервных копий
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.enableBackup}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, enableBackup: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Уведомления</Label>
                      <p className="text-sm text-muted-foreground">
                        Включить системные уведомления
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.enableNotifications}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, enableNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Тайм-аут сессии (минуты)</Label>
                    <Input
                      type="number"
                      value={systemSettings.sessionTimeout}
                      onChange={(e) => 
                        setSystemSettings(prev => ({ 
                          ...prev, 
                          sessionTimeout: parseInt(e.target.value) 
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить настройки
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка Логи */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Системные логи</CardTitle>
              <CardDescription>
                Просмотр событий и действий в системе
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getLogIcon(log.level)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{log.action}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(log.timestamp)}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {log.message}
                      </div>
                      {log.user && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Пользователь: {log.user}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}