"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Folder,
  FolderPlus,
  Building2,
  Palette,
  Hash
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface FolderModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (data: any) => void;
  folder?: {
    id: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    companyId?: string;
  };
  mode?: "create" | "edit";
  type?: "folder" | "company";
  trigger?: React.ReactNode;
}

const colors = [
  { name: "Синий", value: "#3b82f6", class: "bg-blue-500" },
  { name: "Зеленый", value: "#10b981", class: "bg-green-500" },
  { name: "Красный", value: "#ef4444", class: "bg-red-500" },
  { name: "Желтый", value: "#f59e0b", class: "bg-yellow-500" },
  { name: "Фиолетовый", value: "#8b5cf6", class: "bg-purple-500" },
  { name: "Оранжевый", value: "#f97316", class: "bg-orange-500" },
  { name: "Розовый", value: "#ec4899", class: "bg-pink-500" },
  { name: "Индиго", value: "#6366f1", class: "bg-indigo-500" },
  { name: "Бирюзовый", value: "#14b8a6", class: "bg-teal-500" },
  { name: "Лаймовый", value: "#84cc16", class: "bg-lime-500" },
  { name: "Циановый", value: "#06b6d4", class: "bg-cyan-500" },
  { name: "Серый", value: "#6b7280", class: "bg-gray-500" },
];

const icons = ["📁", "📂", "🗂️", "📋", "📊", "📈", "📉", "🗃️"];

export function FolderModal({ 
  open, 
  onOpenChange, 
  onSave, 
  folder, 
  mode = "create", 
  type = "folder",
  trigger 
}: FolderModalProps) {
  console.log("FolderModal rendered with props:", { open, onSave: !!onSave, folder, mode, type, trigger: !!trigger });
  
  const [formData, setFormData] = useState({
    name: folder?.name || "",
    description: folder?.description || "",
    color: folder?.color || "#3b82f6",
    icon: folder?.icon || "📁",
    companyId: folder?.companyId || "none",
  });

  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  // Determine if we're using controlled or uncontrolled mode
  const isControlled = open !== undefined && onOpenChange;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

  // Load companies when modal opens
  useEffect(() => {
    if (dialogOpen && type === "folder") {
      loadCompanies();
    }
  }, [dialogOpen, type]);

  const loadCompanies = async () => {
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

  const handleSubmit = () => {
    console.log("=== handleSubmit called ===");
    console.log("formData:", formData);
    console.log("type:", type);
    
    try {
      if (onSave) {
        console.log("onSave function exists, calling it...");
        const saveData = { ...formData, type };
        console.log("Data to save:", saveData);
        onSave(saveData);
        console.log("onSave called successfully");
      } else {
        console.log("ERROR: onSave is undefined");
      }
      
      console.log("Closing modal...");
      setDialogOpen(false);
      console.log("=== handleSubmit completed ===");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const title = type === "folder" ? "Папка" : "Предприятие";
  const icon = type === "folder" ? <Folder className="h-5 w-5" /> : <Building2 className="h-5 w-5" />;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            Добавить папку
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? `Создайте новую ${type === "folder" ? "папку для организации паролей" : "предприятие"}`
              : `Измените данные ${type === "folder" ? "папки" : "предприятия"}`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              placeholder={type === "folder" ? "Например: Работа" : "Например: Базальт Агро"}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          {type === "folder" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  placeholder="Дополнительная информация о папке..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Цвет</Label>
                <div className="px-1">
                  <div className="grid grid-cols-6 gap-2 w-full">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={cn(
                          "w-10 h-10 rounded border-2 transition-colors mx-auto",
                          formData.color === color.value && "border-primary",
                          color.class
                        )}
                        onClick={() => handleInputChange("color", color.value)}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Привязать к предприятию (опционально)</Label>
                <Select value={formData.companyId} onValueChange={(value) => handleInputChange("companyId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите предприятие" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без предприятия</SelectItem>
                    {loading ? (
                      <SelectItem value="loading" disabled>Загрузка...</SelectItem>
                    ) : (
                      companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {type === "company" && (
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                placeholder="Описание предприятия..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button type="button" onClick={handleSubmit}>
              {mode === "create" ? "Создать" : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}