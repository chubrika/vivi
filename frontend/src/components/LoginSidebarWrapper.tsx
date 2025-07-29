'use client';

import { useLoginSidebar } from '../contexts/LoginSidebarContext';
import LoginSidebar from './LoginSidebar';

export default function LoginSidebarWrapper() {
  const { isLoginSidebarOpen, closeLoginSidebar } = useLoginSidebar();

  return (
    <LoginSidebar 
      isOpen={isLoginSidebarOpen} 
      onClose={closeLoginSidebar} 
    />
  );
}