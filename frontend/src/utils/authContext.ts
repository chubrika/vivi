import { useState, useEffect, createContext, useContext, ReactNode, createElement } from 'react';

// Define a proper User type to replace 'any'
interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
  refreshToken: async () => false
});

// Helper function to validate JWT token format
const isValidJWT = (token: string): boolean => {
  // Basic JWT format validation (header.payload.signature)
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  try {
    // Check if each part is valid base64
    parts.forEach(part => {
      // Replace URL-safe characters
      const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
      // Add padding if needed
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
      atob(padded);
    });
    return true;
  } catch (e) {
    return false;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Check for token in localStorage on initial load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        // Validate token format
        if (!isValidJWT(storedToken)) {
          console.error('Invalid token format detected');
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }
        
        const parsedUser = JSON.parse(storedUser) as User;
        setToken(storedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setIsAdmin(parsedUser.role === 'admin');
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (newToken: string, userData: User) => {
    // Validate token format before storing
    if (!isValidJWT(newToken)) {
      console.error('Invalid token format provided to login function');
      return;
    }
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
    setIsAdmin(userData.role === 'admin');
    
    // Dispatch storage event to notify other tabs
    window.dispatchEvent(new Event('storage'));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    
    // Dispatch storage event to notify other tabs
    window.dispatchEvent(new Event('storage'));
  };

  const refreshToken = async (): Promise<boolean> => {
    if (isRefreshing) return false;
    
    setIsRefreshing(true);
    
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        logout();
        return false;
      }
      
      const userData = JSON.parse(storedUser) as User;
      
      // Call the login endpoint with the user's email
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          // We need to store the password securely for this to work
          // For now, we'll just redirect to login
          redirectToLogin: true
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Validate the new token before using it
        if (!isValidJWT(data.token)) {
          console.error('Invalid token format received from refresh');
          logout();
          return false;
        }
        
        login(data.token, data.user);
        return true;
      } else {
        // If refresh fails, log out the user
        logout();
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  const value = {
    isAuthenticated,
    isAdmin,
    token,
    user,
    login,
    logout,
    refreshToken
  };

  return createElement(
    AuthContext.Provider,
    { value },
    children
  );
};

export const useAuth = () => useContext(AuthContext);

// Token management utility functions
export const getToken = (): string | null => {
  const token = localStorage.getItem('token');
  if (token && !isValidJWT(token)) {
    console.error('Invalid token format detected in getToken');
    localStorage.removeItem('token');
    return null;
  }
  return token;
};

export const setToken = (token: string): void => {
  if (!isValidJWT(token)) {
    console.error('Invalid token format provided to setToken');
    return;
  }
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// Authentication state utility function
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

// API request helper with authentication
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}; 