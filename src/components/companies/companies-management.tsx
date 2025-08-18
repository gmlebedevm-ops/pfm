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
  Building2, 
  Building, 
  Edit, 
  Trash2, 
  Share2, 
  Users, 
  Folder,
  Plus,
  Filter,
  Copy,
  Mail,
  UserPlus,
  Shield,
  ShieldCheck,
  Save,
  X,
  Globe,
  MapPin,
  Phone,
  Mail as MailIcon
} from "lucide-react";
import { FolderModal } from "@/components/folders/folder-modal";
import { apiClient } from "@/lib/api-client";

interface CompanyData {
  id: string;
  name: string;
  description?: string;
  website?: string;
  address?: string;
  phone?: string;
  email?: string;
  count: number;
  createdAt: string;
  updatedAt: string;
  folders?: any[];
}

interface FoldersManagementProps {
  onClose?: () => void;
  selectedCompanyId?: string;
}

export function CompaniesManagement({ onClose, selectedCompanyId }: FoldersManagementProps) {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    website: "",
    address: "",
    phone: "",
    email: ""
  });
  
  // Новые состояния для фильтрации
  const [sortBy, setSortBy] = useState<"name" | "created" | "folders">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Загрузка предприятий
  useEffect(() => {
    loadData();
  }, []);

  // Обработка выбранного предприятия для редактирования
  useEffect(() => {
    if (selectedCompanyId && companies.length > 0) {
      const company = companies.find(c => c.id === selectedCompanyId);
      if (company) {
        handleEditCompany(company);
      }
    }
  }, [selectedCompanyId, companies]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCompanies();

      if (response.data) {
        setCompanies(response.data);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCompany = (company: CompanyData) => {
    setSelectedCompany(company);
    setEditForm({
      name: company.name,
      description: company.description || "",
      website: company.website || "",
      address: company.address || "",
      phone: company.phone || "",
      email: company.email || ""
    });
    setIsEditing(true);
  };

  const handleUpdateCompany = async () => {
    if (!selectedCompany) return;

    setSaveStatus("saving");
    try {
      const response = await apiClient.updateCompany(selectedCompany.id, editForm);
      
      if (response.data) {
        setSaveStatus("success");
        await loadData();
        setIsEditing(false);
        setSelectedCompany(null);
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    } catch (error) {
      console.error('Error updating company:', error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  const handleDeleteCompany = async (company: CompanyData) => {
    if (!confirm(`Вы уверены, что хотите удалить предприятие "${company.name}"?`)) return;

    try {
      const response = await apiClient.deleteCompany(company.id);
      
      if (response.data !== undefined) {
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  const handleSaveCompany = async (data: any) => {
    console.log("handleSaveCompany called with data:", data);
    try {
      const response = await apiClient.createCompany({
        name: data.name,
        description: data.description
      });

      if (response.data) {
        await loadData(); // Reload companies
        console.log("Предприятие сохранено:", response.data);
      } else if (response.error) {
        console.error('Error creating company:', response.error);
      }
    } catch (error) {
      console.error('Error in handleSaveCompany:', error);
    }
  };

  // Фильтрация и сортировка предприятий
  const filteredCompanies = companies.sort((a, b) => {
    let compareValue = 0;
    
    switch (sortBy) {
      case "name":
        compareValue = a.name.localeCompare(b.name);
        break;
      case "created":
        compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "folders":
        compareValue = (a.count || 0) - (b.count || 0);
        break;
    }
    
    return sortOrder === "asc" ? compareValue : -compareValue;
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
            <h1 className="text-2xl font-bold">Управление предприятиями</h1>
            <p className="text-muted-foreground">
              {companies.length} предприятий
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value="name">
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
            </Select>
            
            <Button>
              <Building2 className="h-4 w-4 mr-2" />
              Создать предприятие
            </Button>
          </div>
        </div>

        {/* Сетка предприятий - показываем скелетоны на сервере */}
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

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Управление предприятиями</h1>
          <p className="text-muted-foreground">
            {companies.length} предприятий
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">По имени</SelectItem>
              <SelectItem value="created">По дате</SelectItem>
              <SelectItem value="folders">По папкам</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "А-Я" : "Я-А"}
          </Button>
          
          <FolderModal
            trigger={
              <Button>
                <Building2 className="h-4 w-4 mr-2" />
                Создать предприятие
              </Button>
            }
            onSave={handleSaveCompany}
            mode="create"
            type="company"
          />
        </div>
      </div>

      {/* Статус сохранения */}
      {saveStatus === "success" && (
        <Alert className="mt-2">
          <AlertDescription className="text-green-600">
            Предприятие успешно обновлено
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === "error" && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>
            Произошла ошибка при обновлении предприятия
          </AlertDescription>
        </Alert>
      )}

      {/* Сетка предприятий */}
      {filteredCompanies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Нет предприятий</h3>
          <p className="text-muted-foreground mb-4">
            Создайте ваше первое предприятие
          </p>
          <FolderModal
            trigger={
              <Button>
                <Building2 className="h-4 w-4 mr-2" />
                Создать предприятие
              </Button>
            }
            onSave={handleSaveCompany}
            mode="create"
            type="company"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="relative group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg leading-6">{company.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleEditCompany(company)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteCompany(company)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {company.description && (
                  <CardDescription className="line-clamp-2">
                    {company.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Контактная информация */}
                  {(company.website || company.email || company.phone || company.address) && (
                    <div className="space-y-1">
                      {company.website && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <span className="truncate">{company.website}</span>
                        </div>
                      )}
                      {company.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MailIcon className="h-3 w-3" />
                          <span className="truncate">{company.email}</span>
                        </div>
                      )}
                      {company.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span className="truncate">{company.phone}</span>
                        </div>
                      )}
                      {company.address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{company.address}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Статистика */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {company.count || 0} папок
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(company.createdAt).toLocaleDateString('ru-RU')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Модальное окно редактирования */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактирование предприятия</DialogTitle>
            <DialogDescription>
              Измените информацию о предприятии
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название *</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  placeholder="Название предприятия"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Веб-сайт</Label>
                <Input
                  id="website"
                  value={editForm.website}
                  onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                placeholder="Описание предприятия"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  placeholder="company@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Адрес</Label>
              <Input
                id="address"
                value={editForm.address}
                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                placeholder="Адрес предприятия"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Отмена
            </Button>
            <Button onClick={handleUpdateCompany} disabled={saveStatus === "saving"}>
              {saveStatus === "saving" ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}