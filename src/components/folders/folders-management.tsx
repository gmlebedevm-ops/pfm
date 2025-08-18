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
import { 
  Folder, 
  FolderPlus, 
  Edit, 
  Trash2, 
  Share2, 
  Users, 
  Building2,
  Palette,
  Save,
  X,
  Plus,
  Search,
  Filter,
  Copy,
  Mail,
  UserPlus,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff
} from "lucide-react";
import { FolderModal } from "@/components/folders/folder-modal";
import { apiClient } from "@/lib/api-client";

interface ShareUser {
  id: string;
  email: string;
  name: string;
  permission: "read" | "write" | "admin";
  avatar?: string;
}

interface FolderData {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  companyId?: string;
  companyName?: string;
  count: number;
  createdAt: string;
  updatedAt: string;
  sharedUsers?: ShareUser[];
  isShared?: boolean;
}

interface CompanyData {
  id: string;
  name: string;
  description?: string;
}

interface FoldersManagementProps {
  onClose?: () => void;
  selectedFolderId?: string;
}

export function FoldersManagement({ onClose, selectedFolderId }: FoldersManagementProps) {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<FolderData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
    icon: "folder",
    companyId: ""
  });
  
  // Новые состояния для фильтрации
  const [filterCompany, setFilterCompany] = useState<string>("");
  const [filterShared, setFilterShared] = useState<string>("all");
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] = useState<"read" | "write" | "admin">("read");
  const [sharedUsers, setSharedUsers] = useState<ShareUser[]>([]);

  // Загрузка папок и предприятий
  useEffect(() => {
    loadData();
  }, []);

  // Обработка выбранной папки для редактирования
  useEffect(() => {
    if (selectedFolderId && folders.length > 0) {
      const folder = folders.find(f => f.id === selectedFolderId);
      if (folder) {
        handleEditFolder(folder);
      }
    }
  }, [selectedFolderId, folders]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [foldersResponse, companiesResponse] = await Promise.all([
        apiClient.getFolders(),
        apiClient.getCompanies()
      ]);

      if (foldersResponse.data) {
        setFolders(foldersResponse.data);
      }
      if (companiesResponse.data) {
        setCompanies(companiesResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditFolder = (folder: FolderData) => {
    setSelectedFolder(folder);
    setEditForm({
      name: folder.name,
      description: folder.description || "",
      color: folder.color || "#3b82f6",
      icon: folder.icon || "folder",
      companyId: folder.companyId || "none"
    });
    setIsEditing(true);
  };

  const handleUpdateFolder = async () => {
    if (!selectedFolder) return;

    setSaveStatus("saving");
    try {
      const formData = {
        ...editForm,
        companyId: editForm.companyId === "none" ? null : editForm.companyId
      };
      
      const response = await apiClient.updateFolder(selectedFolder.id, formData);
      
      if (response.data) {
        setSaveStatus("success");
        await loadData();
        setIsEditing(false);
        setSelectedFolder(null);
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    } catch (error) {
      console.error('Error updating folder:', error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  const handleDeleteFolder = async (folder: FolderData) => {
    if (!confirm(`Вы уверены, что хотите удалить папку "${folder.name}"?`)) return;

    try {
      const response = await apiClient.deleteFolder(folder.id);
      
      if (response.data !== undefined) {
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  const handleShareFolder = (folder: FolderData) => {
    setSelectedFolder(folder);
    setSharedUsers(folder.sharedUsers || []);
    setIsSharing(true);
  };

  const handleAddSharedUser = async () => {
    if (!shareEmail || !selectedFolder) return;
    
    try {
      // Здесь должен быть API вызов для добавления пользователя
      const newUser: ShareUser = {
        id: Date.now().toString(),
        email: shareEmail,
        name: shareEmail.split('@')[0],
        permission: sharePermission
      };
      
      setSharedUsers([...sharedUsers, newUser]);
      setShareEmail("");
      
      // Обновляем папку с новыми пользователями
      const updatedFolder = {
        ...selectedFolder,
        sharedUsers: [...sharedUsers, newUser],
        isShared: true
      };
      
      const response = await apiClient.updateFolder(selectedFolder.id, {
        sharedUsers: [...sharedUsers, newUser]
      });
      
      if (response.data) {
        await loadData();
      }
    } catch (error) {
      console.error('Error adding shared user:', error);
    }
  };

  const handleRemoveSharedUser = async (userId: string) => {
    if (!selectedFolder) return;
    
    try {
      const updatedUsers = sharedUsers.filter(user => user.id !== userId);
      setSharedUsers(updatedUsers);
      
      // Обновляем папку
      const updatedFolder = {
        ...selectedFolder,
        sharedUsers: updatedUsers,
        isShared: updatedUsers.length > 0
      };
      
      const response = await apiClient.updateFolder(selectedFolder.id, {
        sharedUsers: updatedUsers
      });
      
      if (response.data) {
        await loadData();
      }
    } catch (error) {
      console.error('Error removing shared user:', error);
    }
  };

  const handleCopyShareLink = () => {
    if (!selectedFolder) return;
    
    const shareLink = `${window.location.origin}/folders/${selectedFolder.id}/shared`;
    navigator.clipboard.writeText(shareLink);
  };

  const handleSaveFolder = async (data: any) => {
    console.log("handleSaveFolder called with data:", data);
    try {
      const response = await apiClient.createFolder({
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        companyId: data.companyId === "none" ? null : data.companyId
      });

      if (response.data) {
        await loadData(); // Reload folders
        console.log("Папка сохранена:", response.data);
      } else if (response.error) {
        console.error('Error creating folder:', response.error);
      }
    } catch (error) {
      console.error('Error in handleSaveFolder:', error);
    }
  };

  // Фильтрация папок
  const filteredFolders = folders.filter(folder => {
    const matchesCompany = filterCompany === "all" || !filterCompany || folder.companyId === filterCompany;
    
    const matchesShared = filterShared === "all" || 
                         (filterShared === "shared" && folder.isShared) ||
                         (filterShared === "private" && !folder.isShared);
    
    return matchesCompany && matchesShared;
  });

  // Состояние загрузки для серверного рендеринга
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ранний возврат для серверного рендеринга
  if (!isClient) {
    return (
      <div className="space-y-6">
        {/* Заголовок и фильтры */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Управление папками</h1>
            <p className="text-muted-foreground">
              {folders.length} папок
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value="all">
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Предприятие" />
              </SelectTrigger>
            </Select>
            
            <Select value="all">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
            </Select>
            
            <Button>
              <FolderPlus className="h-4 w-4 mr-2" />
              Создать папку
            </Button>
          </div>
        </div>

        {/* Быстрые фильтры */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
            Все папки ({folders.length})
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">
            Общие ({folders.filter(f => f.isShared).length})
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">
            Личные ({folders.filter(f => !f.isShared).length})
          </Badge>
          {companies.slice(0, 3).map((company) => {
            const companyFolders = folders.filter(f => f.companyId === company.id);
            return (
              <Badge key={company.id} variant="outline" className="cursor-pointer hover:bg-accent">
                {company.name} ({companyFolders.length})
              </Badge>
            );
          })}
        </div>

        {/* Сетка папок - показываем скелетоны на сервере */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="bg-muted rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-4 h-4 bg-muted-foreground/20 rounded-full"></div>
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
    );
  }

  const colorOptions = [
    { value: "#3b82f6", label: "Синий", class: "bg-blue-500" },
    { value: "#ef4444", label: "Красный", class: "bg-red-500" },
    { value: "#10b981", label: "Зеленый", class: "bg-green-500" },
    { value: "#f59e0b", label: "Желтый", class: "bg-yellow-500" },
    { value: "#8b5cf6", label: "Фиолетовый", class: "bg-purple-500" },
    { value: "#ec4899", label: "Розовый", class: "bg-pink-500" },
    { value: "#6b7280", label: "Серый", class: "bg-gray-500" },
  ];

  const iconOptions = [
    { value: "folder", label: "Папка", icon: Folder },
    { value: "briefcase", label: "Дело", icon: Folder },
    { value: "home", label: "Дом", icon: Folder },
    { value: "star", label: "Звезда", icon: Folder },
    { value: "heart", label: "Сердце", icon: Folder },
  ];

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Управление папками</h1>
          <p className="text-muted-foreground">
            {filteredFolders.length} папок
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={filterCompany} onValueChange={setFilterCompany}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Предприятие" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterShared} onValueChange={setFilterShared}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="shared">Общие</SelectItem>
              <SelectItem value="private">Личные</SelectItem>
            </SelectContent>
          </Select>
          
          <FolderModal
            trigger={
              <Button>
                <FolderPlus className="h-4 w-4 mr-2" />
                Создать папку
              </Button>
            }
            onSave={handleSaveFolder}
            mode="create"
            type="folder"
          />
        </div>
      </div>

      {/* Быстрые фильтры */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge 
          variant={filterShared === "all" && filterCompany === "all" ? "secondary" : "outline"} 
          className="cursor-pointer hover:bg-secondary/80"
          onClick={() => {
            setFilterShared("all");
            setFilterCompany("all");
          }}
        >
          Все папки ({folders.length})
        </Badge>
        <Badge 
          variant={filterShared === "shared" ? "secondary" : "outline"} 
          className="cursor-pointer hover:bg-accent"
          onClick={() => setFilterShared("shared")}
        >
          Общие ({folders.filter(f => f.isShared).length})
        </Badge>
        <Badge 
          variant={filterShared === "private" ? "secondary" : "outline"} 
          className="cursor-pointer hover:bg-accent"
          onClick={() => setFilterShared("private")}
        >
          Личные ({folders.filter(f => !f.isShared).length})
        </Badge>
        {companies.slice(0, 3).map((company) => {
          const companyFolders = folders.filter(f => f.companyId === company.id);
          return (
            <Badge 
              key={company.id}
              variant={filterCompany === company.id ? "secondary" : "outline"} 
              className="cursor-pointer hover:bg-accent"
              onClick={() => setFilterCompany(company.id)}
            >
              {company.name} ({companyFolders.length})
            </Badge>
          );
        })}
      </div>

      {/* Статус сохранения */}
      {saveStatus === "success" && (
        <Alert className="mt-2">
          <AlertDescription className="text-green-600">
            Папка успешно обновлена
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === "error" && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>
            Произошла ошибка при обновлении папки
          </AlertDescription>
        </Alert>
      )}

      {/* Сетка папок */}
      {filteredFolders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              {filterCompany !== "all" || filterShared !== "all" ? (
                <Search className="h-8 w-8 text-muted-foreground" />
              ) : (
                <Folder className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {filterCompany !== "all" || filterShared !== "all" ? "Папки не найдены" : "Нет папок"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {filterCompany !== "all" || filterShared !== "all" 
              ? "Попробуйте изменить параметры фильтрации."
              : "У вас еще нет созданных папок. Создайте первую папку для организации ваших паролей."
            }
          </p>
          {(filterCompany === "all" && filterShared === "all") && (
            <FolderModal
              trigger={
                <Button>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Создать папку
                </Button>
              }
              onSave={handleSaveFolder}
              mode="create"
              type="folder"
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFolders.map((folder) => (
            <Card key={folder.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: folder.color || "#3b82f6" }}
                    />
                    <CardTitle className="text-lg">{folder.name}</CardTitle>
                    {folder.isShared && (
                      <Share2 className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <Badge variant="secondary">{folder.count}</Badge>
                </div>
                {folder.companyName && (
                  <CardDescription className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {folder.companyName}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                {folder.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {folder.description}
                  </p>
                )}
                
                {folder.isShared && folder.sharedUsers && folder.sharedUsers.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Доступ: {folder.sharedUsers.length} {folder.sharedUsers.length === 1 ? 'пользователь' : 'пользователя'}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditFolder(folder)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareFolder(folder)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFolder(folder)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(folder.updatedAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Диалог редактирования папки */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактировать папку</DialogTitle>
            <DialogDescription>
              Измените информацию о папке
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                placeholder="Введите название папки"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                placeholder="Введите описание папки"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Цвет</Label>
                <Select 
                  value={editForm.color} 
                  onValueChange={(value) => setEditForm({...editForm, color: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${color.class}`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Иконка</Label>
                <Select 
                  value={editForm.icon} 
                  onValueChange={(value) => setEditForm({...editForm, icon: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex items-center gap-2">
                          <icon.icon className="h-4 w-4" />
                          {icon.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Предприятие</Label>
              <Select 
                value={editForm.companyId} 
                onValueChange={(value) => setEditForm({...editForm, companyId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите предприятие" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Нет предприятия</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Отмена
            </Button>
            <Button onClick={handleUpdateFolder} disabled={saveStatus === "saving"}>
              <Save className="h-4 w-4 mr-2" />
              {saveStatus === "saving" ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог общего доступа */}
      <Dialog open={isSharing} onOpenChange={setIsSharing}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Общий доступ к папке</DialogTitle>
            <DialogDescription>
              Настройте доступ к папке "{selectedFolder?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="users">Пользователи</TabsTrigger>
                <TabsTrigger value="link">Ссылка</TabsTrigger>
              </TabsList>
              
              <TabsContent value="users" className="space-y-4">
                <div className="space-y-2">
                  <Label>Пользователи с доступом</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {sharedUsers.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Нет пользователей с доступом</p>
                      </div>
                    ) : (
                      sharedUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select 
                              value={user.permission} 
                              onValueChange={(value: "read" | "write" | "admin") => {
                                const updatedUsers = sharedUsers.map(u => 
                                  u.id === user.id ? { ...u, permission: value } : u
                                );
                                setSharedUsers(updatedUsers);
                              }}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="read">Чтение</SelectItem>
                                <SelectItem value="write">Запись</SelectItem>
                                <SelectItem value="admin">Админ</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSharedUser(user.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="share-email">Добавить пользователя</Label>
                  <div className="flex gap-2">
                    <Input
                      id="share-email"
                      type="email"
                      placeholder="Введите email пользователя"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                    />
                    <Select value={sharePermission} onValueChange={(value: "read" | "write" | "admin") => setSharePermission(value)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read">Чтение</SelectItem>
                        <SelectItem value="write">Запись</SelectItem>
                        <SelectItem value="admin">Админ</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={handleAddSharedUser}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="link" className="space-y-4">
                <div className="space-y-2">
                  <Label>Ссылка для общего доступа</Label>
                  <div className="flex gap-2">
                    <Input
                      value={`${window.location.origin}/folders/${selectedFolder?.id}/shared`}
                      readOnly
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={handleCopyShareLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Отправьте эту ссылку пользователям для предоставления доступа к папке
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Права доступа по ссылке</Label>
                  <Select defaultValue="read">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Только чтение</SelectItem>
                      <SelectItem value="write">Чтение и запись</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSharing(false)}>
              Закрыть
            </Button>
            <Button onClick={() => setIsSharing(false)}>
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}