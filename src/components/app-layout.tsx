"use client";

import React, { useCallback, useEffect, useState } from "react";
import { SidebarMenu } from "@/components/layout/sidebar-menu";
import { Header } from "@/components/layout/header";
import { ViewType } from "@/hooks/use-passwords";

interface AppLayoutProps {
  children: React.ReactNode;
  user?: any;
  onSettingsClick?: () => void;
  onEditFolder?: (folderId: string) => void;
  onEditCompany?: (companyId: string) => void;
  currentView?: ViewType;
  setCurrentView?: (view: ViewType) => void;
  passwordsCount?: {
    all: number;
    favorites: number;
    trash: number;
  };
}

export function AppLayout({ children, user, onSettingsClick, onEditFolder, onEditCompany, currentView, setCurrentView, passwordsCount = { all: 0, favorites: 0, trash: 0 } }: AppLayoutProps) {

  console.log("AppLayout: currentView:", currentView);
  console.log("AppLayout: setCurrentView type:", typeof setCurrentView);

  const handleViewChange = useCallback((view: ViewType) => {
    console.log("AppLayout: handleViewChange called with view:", view);
    console.log("AppLayout: About to call setCurrentView with:", view);
    setCurrentView?.(view);
    console.log("AppLayout: setCurrentView called");
  }, [setCurrentView]);

  // Add useEffect to track currentView changes
  useEffect(() => {
    console.log("AppLayout: currentView changed to:", currentView);
  }, [currentView]);

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onSettingsClick={onSettingsClick} />
        <div className="flex flex-1 overflow-hidden">
          <SidebarMenu 
            currentView={currentView}
            onViewChange={handleViewChange}
            passwordsCount={passwordsCount}
            onSettingsClick={onSettingsClick}
            onEditFolder={onEditFolder}
            onEditCompany={onEditCompany}
          />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}