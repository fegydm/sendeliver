/*
File: ./front/src/contexts/AuthContext.tsx
Last change: Added register function and updated login to use new backend API
*/
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'client' | 'carrier' | 'forwarder';
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on init
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  // Check if token is valid and get user data
  const checkAuth = async (): Promise<boolean> => {
    if (!token) return false;
    try {
      setLoading(true);
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData: User = response.data;
      setUser(userData);
      return true;
    } catch (error) {
      logout();
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (name: string, email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
      setUser(newUser);
    } finally {
      setLoading(false);
    }
  };

  // Login existing user
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
      setUser(newUser);
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isAdmin, register, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for easy usage
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
