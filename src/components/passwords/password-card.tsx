"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Globe,
  User,
  MoreHorizontal,
  Star,
  Copy,
  Eye,
  EyeOff,
  Edit,
  Share,
  Trash2,
  Lock,
  RotateCcw
} from "lucide-react";
import { encryptionManager, decryptPassword, isEncryptionReady } from "@/lib/encryption";

interface PasswordCardProps {
  password: {
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
    isEncrypted?: boolean;
  };
  className?: string;
  onToggleFavorite?: (id: string) => void;
  onToggleTrash?: (id: string) => void;
  onRestore?: (id: string) => void;
  onEdit?: (password: any) => void;
  onDelete?: (id: string) => void;
}

export function PasswordCard({ 
  password, 
  className, 
  onToggleFavorite,
  onToggleTrash,
  onRestore,
  onEdit,
  onDelete
}: PasswordCardProps) {
  const [isClient, setIsClient] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFavorite, setIsFavorite] = useState(password.favorite || false);
  const [decryptedPassword, setDecryptedPassword] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ранний возврат для серверного рендеринга, чтобы избежать гидратации
  if (!isClient) {
    return (
      <Card className={cn("group hover:shadow-md transition-all duration-200", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {password.icon || "••"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{password.title}</h3>
                {password.username && (
                  <p className="text-xs text-muted-foreground truncate">
                    {password.username}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Star className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">••••••••</span>
            </div>
            {password.url && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">
                  {new URL(password.url).hostname}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {password.company && (
                <Badge variant="outline" className="text-xs">
                  {password.company}
                </Badge>
              )}
              {password.folder && (
                <Badge variant="secondary" className="text-xs">
                  {password.folder}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const decryptPasswordData = async () => {
    if (!password.password || !password.isEncrypted) {
      return password.password || "••••••••";
    }

    try {
      setIsDecrypting(true);
      const encryptedData = JSON.parse(password.password);
      const decrypted = await decryptPassword(encryptedData);
      setDecryptedPassword(decrypted);
      return decrypted;
    } catch (error) {
      console.error('Failed to decrypt password:', error);
      return "••••••••";
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleShowPassword = async () => {
    if (!showPassword && password.isEncrypted && !decryptedPassword) {
      await decryptPasswordData();
    }
    setShowPassword(!showPassword);
  };

  const handleCopyPassword = async () => {
    let passwordToCopy = password.password || "••••••••";
    
    if (password.isEncrypted) {
      if (!decryptedPassword) {
        passwordToCopy = await decryptPasswordData();
      } else {
        passwordToCopy = decryptedPassword;
      }
    }
    
    navigator.clipboard.writeText(passwordToCopy);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    onToggleFavorite?.(password.id);
  };

  const toggleTrash = () => {
    onToggleTrash?.(password.id);
  };

  const restoreFromTrash = () => {
    onRestore?.(password.id);
  };

  const handleEdit = () => {
    onEdit?.(password);
  };

  const handleDelete = () => {
    onDelete?.(password.id);
  };

  const getInitials = (title: string) => {
    if (!title) return "";
    // Очищаем строку и разбиваем на слова
    const words = title.trim().split(/\s+/);
    // Берем первые буквы каждого слова, ограничиваем 2 символами
    const initials = words
      .slice(0, 2) // Максимум 2 слова
      .map(word => word.charAt(0).toUpperCase())
      .join("");
    return initials || "••";
  };

  if (password.inTrash) {
    return (
      <Card className={cn("group hover:shadow-md transition-all duration-200 opacity-75", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {password.icon || getInitials(password.title)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{password.title}</h3>
                {password.username && (
                  <p className="text-xs text-muted-foreground truncate">
                    {password.username}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                onClick={restoreFromTrash}
                title="Восстановить"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                onClick={handleDelete}
                title="Удалить окончательно"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* URL */}
            {password.url && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">
                  {new URL(password.url).hostname}
                </span>
              </div>
            )}

            {/* Теги */}
            <div className="flex items-center gap-2 flex-wrap">
              {password.company && (
                <Badge variant="outline" className="text-xs">
                  {password.company}
                </Badge>
              )}
              {password.folder && (
                <Badge variant="secondary" className="text-xs">
                  {password.folder}
                </Badge>
              )}
            </div>

            {/* Статус */}
            <div className="text-xs text-muted-foreground">
              В корзине
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("group hover:shadow-md transition-all duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {password.icon || getInitials(password.title)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{password.title}</h3>
              {password.username && (
                <p className="text-xs text-muted-foreground truncate">
                  {password.username}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={toggleFavorite}
            >
              <Star 
                className={cn(
                  "h-4 w-4",
                  isFavorite && "fill-yellow-400 text-yellow-400"
                )}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleCopy(password.username || "")}>
                  <Copy className="h-4 w-4 mr-2" />
                  Копировать логин
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShowPassword()}>
                  {showPassword ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Скрыть пароль
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Показать пароль
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => password.url && window.open(password.url, '_blank')}>
                  <Globe className="h-4 w-4 mr-2" />
                  Открыть сайт
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Изменить
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className="h-4 w-4 mr-2" />
                  Поделиться
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTrash} className="text-orange-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  В корзину
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Пароль */}
          <div className="flex items-center gap-2">
            <Lock className={cn(
              "h-4 w-4",
              password.isEncrypted ? "text-green-500" : "text-muted-foreground"
            )} />
            <div className="flex-1">
              {isDecrypting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Расшифровка...</span>
                </div>
              ) : showPassword ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">
                    {decryptedPassword || (password.isEncrypted ? "••••••••" : password.password || "••••••••")}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={handleCopyPassword}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">••••••••</span>
              )}
            </div>
            {password.isEncrypted && (
              <div className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">E2E</span>
              </div>
            )}
          </div>

          {/* URL */}
          {password.url && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground truncate">
                {new URL(password.url).hostname}
              </span>
            </div>
          )}

          {/* Теги */}
          <div className="flex items-center gap-2 flex-wrap">
            {password.company && (
              <Badge variant="outline" className="text-xs">
                {password.company}
              </Badge>
            )}
            {password.folder && (
              <Badge variant="secondary" className="text-xs">
                {password.folder}
              </Badge>
            )}
          </div>

          {/* Последний доступ */}
          {password.lastAccessed && (
            <div className="text-xs text-muted-foreground">
              Последний доступ: {password.lastAccessed}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}