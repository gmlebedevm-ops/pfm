"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Shield, 
  Palette, 
  Bell, 
  Download, 
  Key, 
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Save,
  RotateCcw,
  X,
  Settings
} from "lucide-react";

interface CompactSettingsProps {
  user?: any;
  onClose: () => void;
}

export function CompactSettings({ user, onClose }: CompactSettingsProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const settingsRef = useRef<HTMLDivElement>(null);

  // Состояние профиля
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "",
    avatar: "",
    timezone: "Europe/Moscow",
    language: "ru"
  });

  // Состояние безопасности
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    masterPasswordSet: true,
    sessionTimeout: 30,
    autoLock: true,
    autoLockTimeout: 5,
    passwordStrength: "strong"
  });

  // Состояние внешнего вида
  const [appearance, setAppearance] = useState({
    theme: "system",
    accentColor: "blue",
    fontSize: "medium",
    density: "comfortable",
    sidebarCollapsed: false
  });

  // Состояние уведомлений
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    passwordExpiry: true,
    securityAlerts: true,
    sharedAccess: true,
    weeklyReports: false
  });

  // Закрывать настройки при клике вне их области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus("saving");
    
    try {
      // Здесь будет логика сохранения настроек
      await new Promise(resolve => setTimeout(resolve, 1500)); // Имитация сохранения
      
      setSaveStatus("success");
      setTimeout(() => {
        setSaveStatus("idle");
        onClose(); // Закрываем настройки после успешного сохранения
      }, 1500);
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Сброс к настройкам по умолчанию
    setProfile({
      name: user?.name || "",
      email: user?.email || "",
      bio: "",
      avatar: "",
      timezone: "Europe/Moscow",
      language: "ru"
    });
    
    setSecurity({
      twoFactorEnabled: false,
      masterPasswordSet: true,
      sessionTimeout: 30,
      autoLock: true,
      autoLockTimeout: 5,
      passwordStrength: "strong"
    });
    
    setAppearance({
      theme: "system",
      accentColor: "blue",
      fontSize: "medium",
      density: "comfortable",
      sidebarCollapsed: false
    });
    
    setNotifications({
      emailNotifications: true,
      pushNotifications: true,
      passwordExpiry: true,
      securityAlerts: true,
      sharedAccess: true,
      weeklyReports: false
    });
  };

  const tabs = [
    { id: "profile", label: "Профиль", icon: User },
    { id: "security", label: "Безопасность", icon: Shield },
    { id: "appearance", label: "Внешний вид", icon: Palette },
    { id: "notifications", label: "Уведомления", icon: Bell },
    { id: "data", label: "Данные", icon: Download },
  ];

  return (
    <div className="flex-1 space-y-6" ref={settingsRef}>
      <div className="max-w-6xl mx-auto">
        {/* Заголовок страницы */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Настройки</h1>
            <p className="text-muted-foreground">Управление профилем и предпочтениями</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReset}
              disabled={loading}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Сброс
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-1" />
              {loading ? "Сохранение..." : "Сохранить"}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
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

        {/* Верхняя панель с вкладками */}
        <div className="border-b">
          <nav className="flex space-x-1 sm:space-x-8 overflow-x-auto px-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1 sm:gap-2 py-3 px-2 sm:px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap min-w-fit",
                    activeTab === tab.id 
                      ? "border-primary text-primary" 
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xs">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Содержимое выбранной вкладки */}
        <div className="mt-4 sm:mt-6">
        {/* Профиль */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback>
                  {profile.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Button variant="outline" size="sm">
                  Изменить фото
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  placeholder="Введите имя"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  placeholder="Введите email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">О себе</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                placeholder="Расскажите о себе..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Часовой пояс</Label>
                <Select value={profile.timezone} onValueChange={(value) => setProfile({...profile, timezone: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Moscow">Москва (UTC+3)</SelectItem>
                    <SelectItem value="Europe/London">Лондон (UTC+0)</SelectItem>
                    <SelectItem value="America/New_York">Нью-Йорк (UTC-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Язык</Label>
                <Select value={profile.language} onValueChange={(value) => setProfile({...profile, language: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Безопасность */}
        {activeTab === "security" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Двухфакторная аутентификация</Label>
                <p className="text-sm text-muted-foreground">
                  Дополнительный уровень безопасности
                </p>
              </div>
              <Switch
                checked={security.twoFactorEnabled}
                onCheckedChange={(checked) => setSecurity({...security, twoFactorEnabled: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Главный пароль</Label>
                <p className="text-sm text-muted-foreground">
                  {security.masterPasswordSet ? "Установлен" : "Не установлен"}
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Key className="h-4 w-4 mr-2" />
                {security.masterPasswordSet ? "Изменить" : "Установить"}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Тайм-аут сессии</Label>
              <Select 
                value={security.sessionTimeout.toString()} 
                onValueChange={(value) => setSecurity({...security, sessionTimeout: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 минут</SelectItem>
                  <SelectItem value="30">30 минут</SelectItem>
                  <SelectItem value="60">1 час</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Автоматическая блокировка</Label>
                <p className="text-sm text-muted-foreground">
                  Блокировать при неактивности
                </p>
              </div>
              <Switch
                checked={security.autoLock}
                onCheckedChange={(checked) => setSecurity({...security, autoLock: checked})}
              />
            </div>

            {security.autoLock && (
              <div className="space-y-2">
                <Label htmlFor="autoLockTimeout">Время до блокировки</Label>
                <Select 
                  value={security.autoLockTimeout.toString()} 
                  onValueChange={(value) => setSecurity({...security, autoLockTimeout: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 минута</SelectItem>
                    <SelectItem value="5">5 минут</SelectItem>
                    <SelectItem value="10">10 минут</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Внешний вид */}
        {activeTab === "appearance" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Тема оформления</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => setAppearance({...appearance, theme: "light"})}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors",
                    appearance.theme === "light" 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Sun className="h-5 w-5" />
                  <span className="text-xs">Светлая</span>
                </button>
                <button
                  onClick={() => setAppearance({...appearance, theme: "dark"})}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors",
                    appearance.theme === "dark" 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Moon className="h-5 w-5" />
                  <span className="text-xs">Темная</span>
                </button>
                <button
                  onClick={() => setAppearance({...appearance, theme: "system"})}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors",
                    appearance.theme === "system" 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Monitor className="h-5 w-5" />
                  <span className="text-xs">Системная</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fontSize">Размер шрифта</Label>
                <Select 
                  value={appearance.fontSize} 
                  onValueChange={(value) => setAppearance({...appearance, fontSize: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Маленький</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="large">Большой</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="density">Плотность интерфейса</Label>
                <Select 
                  value={appearance.density} 
                  onValueChange={(value) => setAppearance({...appearance, density: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Компактный</SelectItem>
                    <SelectItem value="comfortable">Комфортный</SelectItem>
                    <SelectItem value="spacious">Просторный</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Свернутая боковая панель</Label>
                <p className="text-sm text-muted-foreground">
                  Отображать боковую панель свернутой
                </p>
              </div>
              <Switch
                checked={appearance.sidebarCollapsed}
                onCheckedChange={(checked) => setAppearance({...appearance, sidebarCollapsed: checked})}
              />
            </div>
          </div>
        )}

        {/* Уведомления */}
        {activeTab === "notifications" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email уведомления</Label>
                <p className="text-sm text-muted-foreground">
                  Получать уведомления по email
                </p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push уведомления</Label>
                <p className="text-sm text-muted-foreground">
                  Получать push уведомления
                </p>
              </div>
              <Switch
                checked={notifications.pushNotifications}
                onCheckedChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Истечение пароля</Label>
                <p className="text-sm text-muted-foreground">
                  Уведомлять об истекающих паролях
                </p>
              </div>
              <Switch
                checked={notifications.passwordExpiry}
                onCheckedChange={(checked) => setNotifications({...notifications, passwordExpiry: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Оповещения безопасности</Label>
                <p className="text-sm text-muted-foreground">
                  Уведомлять о событиях безопасности
                </p>
              </div>
              <Switch
                checked={notifications.securityAlerts}
                onCheckedChange={(checked) => setNotifications({...notifications, securityAlerts: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Общий доступ</Label>
                <p className="text-sm text-muted-foreground">
                  Уведомлять о предоставлении доступа
                </p>
              </div>
              <Switch
                checked={notifications.sharedAccess}
                onCheckedChange={(checked) => setNotifications({...notifications, sharedAccess: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Еженедельные отчеты</Label>
                <p className="text-sm text-muted-foreground">
                  Получать еженедельные отчеты
                </p>
              </div>
              <Switch
                checked={notifications.weeklyReports}
                onCheckedChange={(checked) => setNotifications({...notifications, weeklyReports: checked})}
              />
            </div>
          </div>
        )}

        {/* Данные */}
        {activeTab === "data" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Экспорт данных</h4>
                <p className="text-sm text-muted-foreground">
                  Скачать резервную копию паролей
                </p>
              </div>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Импорт данных</h4>
                <p className="text-sm text-muted-foreground">
                  Импортировать пароли из файла
                </p>
              </div>
              <Button variant="outline">
                Импорт
              </Button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}