"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Shield, 
  Palette, 
  Bell, 
  Download, 
  Upload, 
  Key, 
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Trash2,
  Plus,
  ArrowLeft
} from "lucide-react";

interface SettingsPageProps {
  onBack?: () => void;
  user?: any;
}

export function SettingsPage({ onBack, user }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

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

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus("saving");
    
    try {
      // Здесь будет логика сохранения настроек
      await new Promise(resolve => setTimeout(resolve, 1500)); // Имитация сохранения
      
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Заголовок страницы */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">Настройки</h1>
            <p className="text-muted-foreground">Управление профилем и предпочтениями</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            disabled={loading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Сбросить
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </div>
      </div>

      {/* Статус сохранения */}
      {saveStatus === "success" && (
        <Alert>
          <AlertDescription className="text-green-600">
            Настройки успешно сохранены
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === "error" && (
        <Alert variant="destructive">
          <AlertDescription>
            Произошла ошибка при сохранении настроек
          </AlertDescription>
        </Alert>
      )}

      {/* Основное содержимое */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Боковая панель с вкладками */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Разделы</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                    activeTab === "profile" 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <User className="h-4 w-4" />
                  Профиль
                </button>
                
                <button
                  onClick={() => setActiveTab("security")}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                    activeTab === "security" 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Shield className="h-4 w-4" />
                  Безопасность
                </button>
                
                <button
                  onClick={() => setActiveTab("appearance")}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                    activeTab === "appearance" 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Palette className="h-4 w-4" />
                  Внешний вид
                </button>
                
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                    activeTab === "notifications" 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Bell className="h-4 w-4" />
                  Уведомления
                </button>
                
                <button
                  onClick={() => setActiveTab("data")}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                    activeTab === "data" 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Download className="h-4 w-4" />
                  Данные
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Содержимое выбранной вкладки */}
        <div className="lg:col-span-3">
          {/* Профиль */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Профиль пользователя</CardTitle>
                  <CardDescription>
                    Управление основной информацией профиля
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={profile.avatar} alt={profile.name} />
                      <AvatarFallback className="text-lg">
                        {profile.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Изменить фото
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, GIF или PNG. Максимальный размер 1MB
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <SelectItem value="Asia/Tokyo">Токио (UTC+9)</SelectItem>
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
                          <SelectItem value="de">Deutsch</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Безопасность */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Аутентификация</CardTitle>
                  <CardDescription>
                    Управление настройками безопасности и аутентификации
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Двухфакторная аутентификация</Label>
                      <p className="text-sm text-muted-foreground">
                        Дополнительный уровень безопасности для вашего аккаунта
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
                    <Label htmlFor="sessionTimeout">Тайм-аут сессии (минуты)</Label>
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
                        <SelectItem value="120">2 часа</SelectItem>
                        <SelectItem value="0">Никогда</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Автоматическая блокировка</CardTitle>
                  <CardDescription>
                    Настройки автоматической блокировки приложения
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Автоматическая блокировка</Label>
                      <p className="text-sm text-muted-foreground">
                        Блокировать приложение при неактивности
                      </p>
                    </div>
                    <Switch
                      checked={security.autoLock}
                      onCheckedChange={(checked) => setSecurity({...security, autoLock: checked})}
                    />
                  </div>

                  {security.autoLock && (
                    <div className="space-y-2">
                      <Label htmlFor="autoLockTimeout">Время до блокировки (минуты)</Label>
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
                          <SelectItem value="30">30 минут</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Внешний вид */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Тема</CardTitle>
                  <CardDescription>
                    Настройка внешнего вида приложения
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Тема оформления</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <button
                        onClick={() => setAppearance({...appearance, theme: "light"})}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors",
                          appearance.theme === "light" 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <Sun className="h-6 w-6" />
                        <span className="text-sm">Светлая</span>
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
                        <Moon className="h-6 w-6" />
                        <span className="text-sm">Темная</span>
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
                        <Monitor className="h-6 w-6" />
                        <span className="text-sm">Системная</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Акцентный цвет</Label>
                    <div className="grid grid-cols-6 gap-2">
                      {["blue", "green", "red", "purple", "orange", "pink"].map((color) => (
                        <button
                          key={color}
                          onClick={() => setAppearance({...appearance, accentColor: color})}
                          className={cn(
                            "w-8 h-8 rounded-full border-2 transition-colors",
                            appearance.accentColor === color 
                              ? "border-primary" 
                              : "border-border hover:border-primary/50"
                          )}
                          style={{ backgroundColor: `var(--${color}-500)` }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Отображение</CardTitle>
                  <CardDescription>
                    Настройка отображения интерфейса
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Свернутая боковая панель</Label>
                      <p className="text-sm text-muted-foreground">
                        Отображать боковую панель в свернутом виде
                      </p>
                    </div>
                    <Switch
                      checked={appearance.sidebarCollapsed}
                      onCheckedChange={(checked) => setAppearance({...appearance, sidebarCollapsed: checked})}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Уведомления */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email уведомления</CardTitle>
                  <CardDescription>
                    Управление email уведомлениями
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email уведомления</Label>
                      <p className="text-sm text-muted-foreground">
                        Получать уведомления по электронной почте
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Истечение срока пароля</Label>
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
                        Получать еженедельные отчеты об активности
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => setNotifications({...notifications, weeklyReports: checked})}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Push уведомления</CardTitle>
                  <CardDescription>
                    Управление push уведомлениями в браузере
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push уведомления</Label>
                      <p className="text-sm text-muted-foreground">
                        Получать push уведомления в браузере
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Данные */}
          {activeTab === "data" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Резервное копирование</CardTitle>
                  <CardDescription>
                    Управление резервными копиями данных
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Экспорт данных</h4>
                      <p className="text-sm text-muted-foreground">
                        Скачать все ваши пароли и настройки в зашифрованном файле
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
                        Импортировать пароли из файла резервной копии
                      </p>
                    </div>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Импорт
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Опасные операции</CardTitle>
                  <CardDescription>
                    Действия, которые невозможно отменить
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-destructive">Удалить аккаунт</h4>
                      <p className="text-sm text-muted-foreground">
                        Безвозвратно удалить ваш аккаунт и все данные
                      </p>
                    </div>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Удалить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}