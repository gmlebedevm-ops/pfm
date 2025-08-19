"use client";

import React, { useState, useEffect } from "react";
import { PasswordCard } from "./password-card";
import { PasswordTable } from "./password-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ViewType } from "@/hooks/use-passwords";
import {
  Search,
  Filter,
  SortAsc,
  Grid,
  Table,
  List,
  Plus,
  Trash2,
  Star,
  RotateCcw,
  Inbox,
  Folder
} from "lucide-react";

interface PasswordGridProps {
  passwords: Array<{
    id: string;
    title: string;
    username?: string;
    url?: string;
    icon?: string;
    favorite: boolean;
    inTrash?: boolean;
    lastAccessed?: string;
    company?: string;
    folder?: string;
    folderId?: string;
  }>;
  viewMode?: "grid" | "table";
  currentView?: ViewType;
  onAddPassword?: () => void;
  onToggleFavorite?: (id: string) => void;
  onToggleTrash?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (password: any) => void;
  onViewModeChange?: (mode: "grid" | "table") => void;
}

export function PasswordGrid({ 
  passwords, 
  viewMode = "grid", 
  currentView = "all",
  onAddPassword,
  onToggleFavorite,
  onToggleTrash,
  onRestore,
  onDelete,
  onEdit,
  onViewModeChange
}: PasswordGridProps) {
  const [isClient, setIsClient] = useState(false);
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Вспомогательные функции - определены в начале для доступа во всем компоненте
  const getTitle = () => {
    if (typeof currentView === 'object' && currentView.type === 'folder') {
      return currentView.folderName;
    }
    
    switch (currentView) {
      case "favorites":
        return "Избранные пароли";
      case "inbox":
        return "Входящие";
      case "trash":
        return "Корзина";
      default:
        return "Все пароли";
    }
  };

  const getEmptyMessage = () => {
    if (typeof currentView === 'object' && currentView.type === 'folder') {
      return `В папке "${currentView.folderName}" нет паролей`;
    }
    
    switch (currentView) {
      case "favorites":
        return "У вас нет избранных паролей";
      case "inbox":
        return "Нет новых паролей";
      case "trash":
        return "Корзина пуста";
      default:
        return "Пароли не найдены";
    }
  };

  const getEmptyAction = () => {
    if (typeof currentView === 'object' && currentView.type === 'folder') {
      return `Добавьте пароли в папку "${currentView.folderName}"`;
    }
    
    switch (currentView) {
      case "favorites":
        return "Добавьте пароли в избранное";
      case "inbox":
        return "Добавьте новые пароли";
      case "trash":
        return null;
      default:
        return "Добавьте первый пароль";
    }
  };

  const showAddButton = currentView !== "trash";

  // Ранний возврат для серверного рендеринга
  if (!isClient) {
    return (
      <div className="space-y-6">
        {/* Заголовок и фильтры */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{getTitle()}</h1>
            <p className="text-muted-foreground">
              {passwords.length} паролей
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value="name">
              <SelectTrigger className="w-40">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
            </Select>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Фильтр
            </Button>
            
            {currentView !== "trash" && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Добавить
              </Button>
            )}
          </div>
        </div>

        {/* Быстрые фильтры */}
        {currentView === "all" && (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
              Все ({passwords.filter(p => !p.inTrash).length})
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              Избранные ({passwords.filter(p => p.favorite && !p.inTrash).length})
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              Общие ({passwords.filter(p => p.folder === "Общие" && !p.inTrash).length})
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              Базальт Агро ({passwords.filter(p => p.company === "Базальт Агро" && !p.inTrash).length})
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              Работа ({passwords.filter(p => p.folder === "Работа" && !p.inTrash).length})
            </Badge>
          </div>
        )}

        {/* Сетка паролей - показываем скелетоны на сервере */}
        <div className="flex justify-between items-center mb-4">
          <div className={viewMode === "grid" ? 
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : 
            "space-y-2"
          }>
            {passwords.slice(0, 8).map((_, index) => (
              <div key={index} className="bg-muted rounded-lg p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-muted-foreground/20 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted-foreground/20 rounded w-full"></div>
                  <div className="h-3 bg-muted-foreground/20 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Фильтрация паролей в зависимости от текущего представления
  const filteredPasswords = passwords.filter(password => {
    if (typeof currentView === 'object' && currentView.type === 'folder') {
      return password.folderId === currentView.folderId && !password.inTrash;
    } else if (currentView === "favorites") {
      return password.favorite && !password.inTrash;
    } else if (currentView === "inbox") {
      return !password.inTrash;
    } else if (currentView === "trash") {
      return password.inTrash;
    } else {
      return !password.inTrash;
    }
  });

  // Сортировка паролей
  const sortedPasswords = [...filteredPasswords].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.title.localeCompare(b.title);
      case "date":
        return new Date(b.lastAccessed || 0).getTime() - new Date(a.lastAccessed || 0).getTime();
      case "favorite":
        return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{getTitle()}</h1>
          <p className="text-muted-foreground">
            {filteredPasswords.length} паролей
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">По имени</SelectItem>
              <SelectItem value="date">По дате</SelectItem>
              <SelectItem value="favorite">Избранные</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Фильтр
          </Button>
          
          {/* Переключатель режимов просмотра */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="h-9 px-3 rounded-r-none"
              onClick={() => onViewModeChange?.("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="h-9 px-3 rounded-l-none"
              onClick={() => onViewModeChange?.("table")}
            >
              <Table className="h-4 w-4" />
            </Button>
          </div>
          
          {showAddButton && (
            <Button onClick={onAddPassword}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить
            </Button>
          )}
        </div>
      </div>

      {/* Быстрые фильтры (только для основного представления) */}
      {currentView === "all" && (
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
            Все ({passwords.filter(p => !p.inTrash).length})
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">
            Избранные ({passwords.filter(p => p.favorite && !p.inTrash).length})
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">
            Общие ({passwords.filter(p => p.folder === "Общие" && !p.inTrash).length})
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">
            Базальт Агро ({passwords.filter(p => p.company === "Базальт Агро" && !p.inTrash).length})
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">
            Работа ({passwords.filter(p => p.folder === "Работа" && !p.inTrash).length})
          </Badge>
        </div>
      )}

      {/* Быстрые фильтры для папок */}
      {typeof currentView === 'object' && currentView.type === 'folder' && (
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
            Все пароли ({passwords.filter(p => !p.inTrash).length})
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">
            Избранные ({passwords.filter(p => p.favorite && !p.inTrash).length})
          </Badge>
        </div>
      )}

      {/* Действия для корзины */}
      {currentView === "trash" && sortedPasswords.length > 0 && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Восстановить все
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Очистить корзину
          </Button>
        </div>
      )}

      {/* Отображение паролей */}
      {sortedPasswords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              {currentView === "favorites" ? (
                <Star className="h-8 w-8 text-muted-foreground" />
              ) : currentView === "inbox" ? (
                <Inbox className="h-8 w-8 text-muted-foreground" />
              ) : currentView === "trash" ? (
                <Trash2 className="h-8 w-8 text-muted-foreground" />
              ) : typeof currentView === 'object' && currentView.type === 'folder' ? (
                <Folder className="h-8 w-8 text-muted-foreground" />
              ) : (
                <Search className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">{getEmptyMessage()}</h3>
          <p className="text-muted-foreground mb-4">
            {getEmptyAction()}
          </p>
          {showAddButton && getEmptyAction() && (
            <Button onClick={onAddPassword}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить первый пароль
            </Button>
          )}
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedPasswords.map((password) => (
                <PasswordCard
                  key={password.id}
                  password={password}
                  onToggleFavorite={onToggleFavorite}
                  onToggleTrash={onToggleTrash}
                  onRestore={onRestore}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ) : (
            <PasswordTable
              passwords={sortedPasswords}
              onToggleFavorite={onToggleFavorite}
              onToggleTrash={onToggleTrash}
              onRestore={onRestore}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
        </>
      )}
    </div>
  );
}