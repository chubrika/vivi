'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CategoryMenuContextType {
  isCategoryMenuOpen: boolean;
  toggleCategoryMenu: () => void;
  closeCategoryMenu: () => void;
  openCategoryMenu: () => void;
}

const CategoryMenuContext = createContext<CategoryMenuContextType | undefined>(undefined);

export const useCategoryMenu = () => {
  const context = useContext(CategoryMenuContext);
  if (context === undefined) {
    throw new Error('useCategoryMenu must be used within a CategoryMenuProvider');
  }
  return context;
};

interface CategoryMenuProviderProps {
  children: ReactNode;
}

export const CategoryMenuProvider: React.FC<CategoryMenuProviderProps> = ({ children }) => {
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const toggleCategoryMenu = () => {
    setIsCategoryMenuOpen(prev => !prev);
  };

  const closeCategoryMenu = () => {
    setIsCategoryMenuOpen(false);
  };

  const openCategoryMenu = () => {
    setIsCategoryMenuOpen(true);
  };

  return (
    <CategoryMenuContext.Provider
      value={{
        isCategoryMenuOpen,
        toggleCategoryMenu,
        closeCategoryMenu,
        openCategoryMenu,
      }}
    >
      {children}
    </CategoryMenuContext.Provider>
  );
};