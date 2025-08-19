"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Star,
  StarOff,
  Trash2,
  RotateCcw,
  Edit,
  MoreHorizontal,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Globe,
  User,
  Folder,
  Building2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PasswordTableProps {
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
  onToggleFavorite?: (id: string) => void;
  onToggleTrash?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (password: any) => void;
}

export function PasswordTable({
  passwords,
  onToggleFavorite,
  onToggleTrash,
  onRestore,
  onDelete,
  onEdit
}: PasswordTableProps) {
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Никогда";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Сегодня";
    if (diffInDays === 1) return "Вчера";
    if (diffInDays < 7) return `${diffInDays} дня назад`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} нед. назад`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} мес. назад`;
    return `${Math.floor(diffInDays / 365)} г. назад`;
  };

  const getFavicon = (url?: string) => {
    if (!url) return null;
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Название</TableHead>
            <TableHead>Логин</TableHead>
            <TableHead>Пароль</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Категории</TableHead>
            <TableHead>Последний доступ</TableHead>
            <TableHead className="w-[100px] text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {passwords.map((password) => (
            <TableRow key={password.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {password.icon ? (
                      <img 
                        src={password.icon} 
                        alt="" 
                        className="w-8 h-8 rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : password.url ? (
                      <img 
                        src={getFavicon(password.url) || ''} 
                        alt="" 
                        className="w-8 h-8 rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{password.title}</h3>
                      {password.favorite && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    {password.inTrash && (
                      <Badge variant="destructive" className="text-xs">
                        В корзине
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {password.username || "—"}
                  </span>
                  {password.username && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(password.username!, "username")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">
                    {showPasswords[password.id] ? "••••••••" : "••••••••"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => togglePasswordVisibility(password.id)}
                  >
                    {showPasswords[password.id] ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard("password", "password")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  {password.url ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => window.open(password.url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                        {new URL(password.url).hostname}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {password.folder && (
                    <Badge variant="outline" className="text-xs">
                      <Folder className="h-3 w-3 mr-1" />
                      {password.folder}
                    </Badge>
                  )}
                  {password.company && (
                    <Badge variant="secondary" className="text-xs">
                      <Building2 className="h-3 w-3 mr-1" />
                      {password.company}
                    </Badge>
                  )}
                  {!password.folder && !password.company && (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {formatDate(password.lastAccessed)}
                </span>
              </TableCell>
              
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {password.inTrash ? (
                      <>
                        <DropdownMenuItem onClick={() => onRestore?.(password.id)}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Восстановить
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete?.(password.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить окончательно
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => onEdit?.(password)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleFavorite?.(password.id)}>
                          {password.favorite ? (
                            <>
                              <StarOff className="h-4 w-4 mr-2" />
                              Удалить из избранного
                            </>
                          ) : (
                            <>
                              <Star className="h-4 w-4 mr-2" />
                              Добавить в избранное
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleTrash?.(password.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          В корзину
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}