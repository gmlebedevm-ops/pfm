"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Key,
  Star,
  Inbox,
  Trash2,
  Folder,
  FolderPlus,
  Building2,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit,
  Shield,
  BarChart3
} from "lucide-react";
import { FolderModal } from "@/components/folders/folder-modal";
import { apiClient } from "@/lib/api-client";
import { ViewType } from "@/hooks/use-passwords";

interface SidebarMenuProps {
  className?: string;
  currentView?: ViewType;
  onViewChange?: (view: ViewType) => void;
  passwordsCount?: {
    all: number;
    favorites: number;
    trash: number;
  };
  onSettingsClick?: () => void;
  onEditFolder?: (folderId: string) => void;
  onEditCompany?: (companyId: string) => void;
}

export function SidebarMenu({ 
  className, 
  currentView = "all",
  onViewChange,
  passwordsCount = { all: 0, favorites: 0, trash: 0 },
  onSettingsClick,
  onEditFolder,
  onEditCompany
}: SidebarMenuProps) {
  const router = useRouter();
  const [foldersExpanded, setFoldersExpanded] = useState(true);
  const [companiesExpanded, setCompaniesExpanded] = useState(true);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  
  // Состояния для хранения папок и предприятий с загрузкой из API
  const [folders, setFolders] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Add logging after state initialization
  console.log("SidebarMenu: Component rendered with props:", {
    currentView,
    onViewChange: typeof onViewChange,
    passwordsCount
  });

  // Load folders from API
  const loadFolders = async () => {
    try {
      console.log("SidebarMenu: Loading folders...");
      const response = await apiClient.getFolders();
      console.log("SidebarMenu: Folders response:", response);
      if (response.data) {
        setFolders(response.data);
        console.log("SidebarMenu: Folders set:", response.data);
        console.log("SidebarMenu: Number of folders loaded:", response.data.length);
      } else {
        console.error('Error loading folders:', response.error);
        // Set empty array on error
        setFolders([]);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      // Set empty array on error
      setFolders([]);
    }
  };

  // Load companies from API
  const loadCompanies = async () => {
    try {
      console.log("SidebarMenu: Loading companies...");
      const response = await apiClient.getCompanies();
      console.log("SidebarMenu: Companies response:", response);
      if (response.data) {
        setCompanies(response.data);
        console.log("SidebarMenu: Companies set:", response.data);
        console.log("SidebarMenu: Number of companies loaded:", response.data.length);
      } else {
        console.error('Error loading companies:', response.error);
        // Set empty array on error
        setCompanies([]);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      // Set empty array on error
      setCompanies([]);
    }
  };

  // Load data on component mount and when dependencies change
  useEffect(() => {
    console.log("SidebarMenu: Component mounted, loading data...");
    const loadData = async () => {
      try {
        console.log("SidebarMenu: Starting to load data...");
        setLoading(true);
        
        // Load folders and companies
        await Promise.all([
          loadFolders(),
          loadCompanies()
        ]);
        
        console.log("SidebarMenu: Data loaded successfully");
      } catch (error) {
        console.error('Error loading data:', error);
        // Set empty arrays on error to prevent infinite loading
        setFolders([]);
        setCompanies([]);
      } finally {
        console.log("SidebarMenu: Setting loading to false");
        setLoading(false);
      }
    };
    loadData();
    
    // Force set loading to false after 3 seconds as a fallback
    const timeout = setTimeout(() => {
      console.log("SidebarMenu: Force setting loading to false after timeout");
      setLoading(false);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, []); // Empty dependency array means this runs only on mount

  // Add a function to manually refresh data
  const refreshData = useCallback(async () => {
    console.log("SidebarMenu: Manually refreshing data...");
    try {
      setLoading(true);
      await Promise.all([
        loadFolders(),
        loadCompanies()
      ]);
      console.log("SidebarMenu: Data refreshed successfully");
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add useEffect to log state changes
  useEffect(() => {
    console.log("SidebarMenu: State updated - folders:", folders.length, "companies:", companies.length, "loading:", loading);
  }, [folders, companies, loading]);

  const menuItems = [
    { 
      id: "all-passwords", 
      label: "Все пароли", 
      icon: Key, 
      count: passwordsCount.all,
      view: "all" as const
    },
    { 
      id: "favorites", 
      label: "Избранное", 
      icon: Star, 
      count: passwordsCount.favorites,
      view: "favorites" as const
    },
    { 
      id: "inbox", 
      label: "Входящие", 
      icon: Inbox, 
      count: 3,
      view: "inbox" as const
    },
    { 
      id: "trash", 
      label: "Корзина", 
      icon: Trash2, 
      count: passwordsCount.trash,
      view: "trash" as const
    },
  ];

  const accountItems = [
    { id: "administration", label: "Администрирование", icon: Shield },
    { id: "analytics", label: "Аналитика", icon: BarChart3 },
    { id: "account", label: "Аккаунт", icon: User },
    { id: "settings", label: "Настройки", icon: Settings },
    { id: "logout", label: "Выйти", icon: LogOut, variant: "destructive" as const },
  ];

  const handleAddFolder = () => {
    setIsFolderModalOpen(true);
  };

  const handleAddCompany = () => {
    setIsCompanyModalOpen(true);
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
        await refreshData(); // Refresh data after creating folder
        console.log("Папка сохранена:", response.data);
      } else if (response.error) {
        console.error('Error creating folder:', response.error);
      }
    } catch (error) {
      console.error('Error in handleSaveFolder:', error);
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
        await refreshData(); // Refresh data after creating company
        console.log("Предприятие сохранено:", response.data);
      } else if (response.error) {
        console.error('Error creating company:', response.error);
      }
    } catch (error) {
      console.error('Error in handleSaveCompany:', error);
    }
  };

  const handleMenuItemClick = useCallback((view: ViewType) => {
    console.log("SidebarMenu: handleMenuItemClick called with view:", view);
    console.log("SidebarMenu: onViewChange function:", typeof onViewChange);
    console.log("SidebarMenu: onViewChange exists:", !!onViewChange);
    if (onViewChange) {
      onViewChange(view);
      console.log("SidebarMenu: onViewChange called successfully");
    } else {
      console.error("SidebarMenu: onViewChange is not defined!");
    }
  }, [onViewChange]);

  const handleAccountItemClick = (itemId: string) => {
    switch (itemId) {
      case "administration":
        // Switch to administration view
        handleMenuItemClick("administration");
        break;
      case "analytics":
        // Switch to analytics view
        handleMenuItemClick("analytics");
        break;
      case "account":
        // Switch to account management view
        handleMenuItemClick("account-management");
        break;
      case "settings":
        // Use onSettingsClick if provided, otherwise navigate to settings page
        if (onSettingsClick) {
          onSettingsClick();
        } else {
          router.push("/settings");
        }
        break;
      case "logout":
        // Handle logout
        console.log("Logout clicked");
        break;
    }
  };

  const handleFolderClick = (folder: any) => {
    const folderView: ViewType = {
      type: "folder",
      folderId: folder.id,
      folderName: folder.name
    };
    console.log("SidebarMenu: Folder clicked:", folder);
    handleMenuItemClick(folderView);
  };

  const handleEditFolder = (folder: any) => {
    console.log("SidebarMenu: Edit folder clicked:", folder);
    if (onEditFolder) {
      onEditFolder(folder.id);
    } else {
      // Fallback: Navigate to folders management
      handleMenuItemClick("folders-management");
    }
  };

  const handleCompanyClick = (company: any) => {
    const companyView: ViewType = {
      type: "company",
      companyId: company.id,
      companyName: company.name
    };
    console.log("SidebarMenu: Company clicked:", company);
    console.log("SidebarMenu: Creating company view:", companyView);
    console.log("SidebarMenu: About to call handleMenuItemClick with:", companyView);
    handleMenuItemClick(companyView);
  };

  const handleEditCompany = (company: any) => {
    console.log("SidebarMenu: Edit company clicked:", company);
    if (onEditCompany) {
      onEditCompany(company.id);
    } else {
      // Fallback: Navigate to companies management
      handleMenuItemClick("companies-management");
    }
  };

  return (
    <div className={cn("w-64 bg-card border-r border-border flex flex-col h-full", className)}>
      {/* Основное содержимое меню */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            {/* Первый раздел */}
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.view;
                return (
                  <button
                    key={item.id}
                    className={cn(
                      "w-full justify-start h-10 px-3 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors",
                      isActive && "bg-secondary text-secondary-foreground"
                    )}
                    onClick={() => {
                      console.log("SidebarMenu: Button clicked for item:", item.id, "view:", item.view);
                      console.log("SidebarMenu: onViewChange function:", typeof onViewChange);
                      handleMenuItemClick(item.view);
                    }}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <Separator />

            {/* Второй раздел - Папки */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <Collapsible open={foldersExpanded} onOpenChange={setFoldersExpanded}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        {foldersExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </Collapsible>
                  <Button
                    variant="ghost"
                    className={cn(
                      "justify-start h-8 px-0",
                      currentView === "folders-management" && "bg-secondary text-secondary-foreground"
                    )}
                    onClick={() => handleMenuItemClick("folders-management")}
                  >
                    <span className="text-sm font-medium">Папки</span>
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={handleAddFolder}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <Collapsible open={foldersExpanded} onOpenChange={setFoldersExpanded}>
                <CollapsibleContent className="space-y-1 mt-2">
                  {loading ? (
                    <div className="pl-8 pr-3 text-sm text-muted-foreground">Загрузка...</div>
                  ) : folders.length === 0 ? (
                    <div className="pl-8 pr-3 text-sm text-muted-foreground">Нет папок</div>
                  ) : (
                    folders.map((folder) => {
                      const isActive = typeof currentView === 'object' && 
                                      currentView.type === 'folder' && 
                                      currentView.folderId === folder.id;
                      console.log("SidebarMenu: Rendering folder:", folder.name, "isActive:", isActive);
                      return (
                        <div key={folder.id} className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            className={cn(
                              "flex-1 justify-start h-9 pl-8 pr-2 cursor-pointer",
                              isActive && "bg-secondary text-secondary-foreground"
                            )}
                            onClick={() => handleFolderClick(folder)}
                          >
                            <div className="flex items-center gap-3">
                              <Folder className="h-4 w-4" />
                              <span className="text-sm">{folder.name}</span>
                            </div>
                          </Button>
                          {isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditFolder(folder);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>

            <Separator />

            {/* Третий раздел - Предприятия */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <Collapsible open={companiesExpanded} onOpenChange={setCompaniesExpanded}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        {companiesExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </Collapsible>
                  <Button
                    variant="ghost"
                    className={cn(
                      "justify-start h-8 px-0",
                      currentView === "companies-management" && "bg-secondary text-secondary-foreground"
                    )}
                    onClick={() => handleMenuItemClick("companies-management")}
                  >
                    <span className="text-sm font-medium">Предприятия</span>
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={handleAddCompany}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <Collapsible open={companiesExpanded} onOpenChange={setCompaniesExpanded}>
                <CollapsibleContent className="space-y-1 mt-2">
                  {loading ? (
                    <div className="pl-8 pr-3 text-sm text-muted-foreground">Загрузка...</div>
                  ) : companies.length === 0 ? (
                    <div className="pl-8 pr-3 text-sm text-muted-foreground">Нет предприятий</div>
                  ) : (
                    companies.map((company) => {
                      const isActive = typeof currentView === 'object' && 
                                      currentView.type === 'company' && 
                                      currentView.companyId === company.id;
                      console.log("SidebarMenu: Rendering company:", company.name, "isActive:", isActive);
                      return (
                        <div key={company.id} className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            className={cn(
                              "flex-1 justify-start h-9 pl-8 pr-2 cursor-pointer",
                              isActive && "bg-secondary text-secondary-foreground"
                            )}
                            onClick={() => handleCompanyClick(company)}
                          >
                            <div className="flex items-center gap-3">
                              <Building2 className="h-4 w-4" />
                              <span className="text-sm">{company.name}</span>
                            </div>
                          </Button>
                          {isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCompany(company);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Нижний раздел с аккаунтом */}
      <div className="border-t border-border p-4">
        <div className="space-y-1">
          {accountItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={item.variant === "destructive" ? "ghost" : "ghost"}
                className={cn(
                  "w-full justify-start h-10 px-3 cursor-pointer",
                  item.variant === "destructive" && "text-destructive hover:text-destructive hover:bg-destructive/10"
                )}
                onClick={() => handleAccountItemClick(item.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                <span className="text-sm">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Модальные окна */}
      <FolderModal
        open={isFolderModalOpen}
        onOpenChange={setIsFolderModalOpen}
        onSave={handleSaveFolder}
        mode="create"
        type="folder"
      />

      <FolderModal
        open={isCompanyModalOpen}
        onOpenChange={setIsCompanyModalOpen}
        onSave={handleSaveCompany}
        mode="create"
        type="company"
      />
    </div>
  );
}