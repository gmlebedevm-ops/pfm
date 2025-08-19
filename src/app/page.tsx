"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PasswordGrid } from "@/components/passwords/password-grid";
import { PasswordModal } from "@/components/passwords/password-modal";
import { AppLayout } from "@/components/app-layout";
import { usePasswords } from "@/hooks/use-passwords";
import { Skeleton } from "@/components/ui/skeleton";
import { FoldersManagement } from "@/components/folders/folders-management";
import { AccountManagement } from "@/components/account/account-management";
import { CompaniesManagement } from "@/components/companies/companies-management";
import { AdministrationManagement } from "@/components/administration/administration-management";
import { SecurityDashboard } from "@/components/analytics/security-dashboard";
import { SettingsPage as SettingsComponent } from "@/components/settings/settings-page";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    passwords,
    loading,
    currentView,
    setCurrentView,
    toggleFavorite,
    toggleTrash,
    restore,
    deletePermanent,
    restoreAll,
    emptyTrash,
    addPassword,
    updatePassword,
    getPasswordsCount
  } = usePasswords();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // Check authentication status
  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    if (status === "authenticated") {
      setIsInitialized(true);
    }
  }, [status, router]);

  // Initialize default user on component mount
  useEffect(() => {
    if (!isInitialized) return;
    
    const initializeApp = async () => {
      try {
        // Check if we need to initialize the database
        const response = await fetch('/api/init', {
          method: 'POST',
        });
        
        if (response.ok) {
          console.log('App initialized successfully');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [isInitialized]);

  const handleAddPassword = () => {
    setEditingPassword(null);
    setIsModalOpen(true);
  };

  const handleEditPassword = (password: any) => {
    console.log("Home: handleEditPassword called with password:", password);
    setEditingPassword(password);
    setIsModalOpen(true);
  };

  const handleSavePassword = (passwordData: any) => {
    if (editingPassword) {
      updatePassword(editingPassword.id, passwordData);
    } else {
      addPassword(passwordData);
    }
    setIsModalOpen(false);
  };

  const handleToggleSettings = () => {
    setCurrentView("settings");
  };

  const handleEditFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
    setCurrentView("folders-management");
  };

  const handleEditCompany = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setCurrentView("companies-management");
  };

  // Reset selected folder ID when not in folders-management view
  useEffect(() => {
    if (currentView !== "folders-management") {
      setSelectedFolderId(null);
    }
  }, [currentView]);

  // Reset selected company ID when not in companies-management view
  useEffect(() => {
    if (currentView !== "companies-management") {
      setSelectedCompanyId(null);
    }
  }, [currentView]);

  if (status === "loading" || !isInitialized || loading) {
    return (
      <AppLayout user={{ name: 'Debug User', email: 'debug@example.com' }}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      user={session?.user || { name: 'Debug User', email: 'debug@example.com' }} 
      onSettingsClick={handleToggleSettings}
      onEditFolder={handleEditFolder}
      onEditCompany={handleEditCompany}
      currentView={currentView}
      setCurrentView={setCurrentView}
      passwordsCount={getPasswordsCount()}
    >
      {currentView === "folders-management" ? (
        <FoldersManagement selectedFolderId={selectedFolderId || undefined} />
      ) : currentView === "account-management" ? (
        <AccountManagement />
      ) : currentView === "companies-management" ? (
        <CompaniesManagement selectedCompanyId={selectedCompanyId || undefined} />
      ) : currentView === "administration" ? (
        <AdministrationManagement />
      ) : currentView === "analytics" ? (
        <SecurityDashboard />
      ) : currentView === "settings" ? (
        <SettingsComponent user={session?.user} />
      ) : (
        <>
          <PasswordGrid 
            passwords={passwords}
            currentView={currentView}
            onAddPassword={handleAddPassword}
            onToggleFavorite={toggleFavorite}
            onToggleTrash={toggleTrash}
            onRestore={restore}
            onDelete={deletePermanent}
            onEdit={handleEditPassword}
          />
          
          <PasswordModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            password={editingPassword}
            mode={editingPassword ? "edit" : "create"}
            onSave={handleSavePassword}
          />
        </>
      )}
    </AppLayout>
  );
}