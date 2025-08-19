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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus
} from "lucide-react";

interface SettingsMainProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

export function SettingsMain({ isOpen, onClose, user }: SettingsMainProps) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <SettingsIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Настройки</h2>
              <p className="text-sm text-muted-foreground">Управление профилем и предпочтениями</p>
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
              {loading ? "Сохранение..." : "Сохранить"}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
            >
              ×
            </Button>
          </div>
        </div>

        {/* Статус сохранения */}
        {saveStatus === "success" && (
          <Alert className="m-4">
            <AlertDescription className="text-green-600">
              Настройки успешно сохранены
            </AlertDescription>
          </Alert>
        )}

        {saveStatus === "error" && (
          <Alert className="m-4" variant="destructive">
            <AlertDescription>
              Произошла ошибка при сохранении настроек
            </AlertDescription>
          </Alert>
        )}

        {/* Основное содержимое */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Профиль</TabsTrigger>
              <TabsTrigger value="security">Безопасность</TabsTrigger>
              <TabsTrigger value="appearance">Внешний вид</TabsTrigger>
              <TabsTrigger value="notifications">Уведомления</TabsTrigger>
              <TabsTrigger value="data">Данные</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Профиль пользователя</h3>
                <p className="text-sm text-muted-foreground">
                  Управление основной информацией профиля
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Основная информация</CardTitle>
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

                  <div className="grid grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-2 gap-4">
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
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Безопасность</h3>
                <p className="text-sm text-muted-foreground">
                  Управление настройками безопасности и аутентификации
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Аутентификация</CardTitle>
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Внешний вид</h3>
                <p className="text-sm text-muted-foreground">
                  Настройка внешнего вида приложения
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Тема</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Тема оформления</Label>
                      <p className="text-sm text-muted-foreground">
                        Выберите тему для приложения
                      </p>
                    </div>
                    <Select value={appearance.theme} onValueChange={(value) => setAppearance({...appearance, theme: value})}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Светлая</SelectItem>
                        <SelectItem value="dark">Тёмная</SelectItem>
                        <SelectItem value="system">Системная</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Уведомления</h3>
                <p className="text-sm text-muted-foreground">
                  Управление уведомлениями и оповещениями
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Email уведомления</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Управление данными</h3>
                <p className="text-sm text-muted-foreground">
                  Импорт, экспорт и управление вашими данными
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Резервное копирование</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Создать резервную копию</h4>
                      <p className="text-sm text-muted-foreground">
                        Скачать все ваши данные в зашифрованном виде
                      </p>
                    </div>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Экспорт
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Вспомогательный компонент для иконки настроек
function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}