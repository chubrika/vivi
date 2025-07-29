'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoginSidebarContextType {
  isLoginSidebarOpen: boolean;
  openLoginSidebar: () => void;
  closeLoginSidebar: () => void;
}

const LoginSidebarContext = createContext<LoginSidebarContextType | undefined>(undefined);

export function LoginSidebarProvider({ children }: { children: ReactNode }) {
  const [isLoginSidebarOpen, setIsLoginSidebarOpen] = useState(false);

  const openLoginSidebar = () => {
    setIsLoginSidebarOpen(true);
  };

  const closeLoginSidebar = () => {
    setIsLoginSidebarOpen(false);
  };

  const value = {
    isLoginSidebarOpen,
    openLoginSidebar,
    closeLoginSidebar,
  };

  return (
    <LoginSidebarContext.Provider value={value}>
      {children}
    </LoginSidebarContext.Provider>
  );
}

export function useLoginSidebar() {
  const context = useContext(LoginSidebarContext);
  if (context === undefined) {
    throw new Error('useLoginSidebar must be used within a LoginSidebarProvider');
  }
  return context;
}