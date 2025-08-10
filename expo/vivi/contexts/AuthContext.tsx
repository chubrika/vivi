import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { AuthResponse } from '../services/authService';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  // Monitor user state changes
  useEffect(() => {
    console.log('AuthContext: User state changed:', user);
  }, [user]);

  const checkUser = async () => {
    try {
      console.log('AuthContext: Checking current user...');
      
      // Add a shorter timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      const userPromise = authService.getCurrentUser();
      const currentUser = await Promise.race([userPromise, timeoutPromise]) as AuthResponse['user'] | null;
      
      console.log('AuthContext: Current user result:', currentUser);
      setUser(currentUser);
    } catch (error) {
      console.error('AuthContext: Error checking user:', error);
      // Don't crash the app, just set user to null
      setUser(null);
    } finally {
      // Always set loading to false to prevent infinite loading
      setLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      console.log('AuthContext: Starting login process');
      const response = await authService.login(credentials);
      console.log('AuthContext: Login successful, setting user:', response.user);
      setUser(response.user);
      console.log('AuthContext: User state updated, should trigger navigation');
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  };

  const register = async (data: { name: string; email: string; password: string }) => {
    try {
      const response = await authService.register(data);
      setUser(response.user);
    } catch (error) {
      console.error('AuthContext: Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      // Even if logout fails, clear the user state
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 