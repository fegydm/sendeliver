/*
 * File: ./front/src/contexts/AuthContext.tsx
 * Last change: Improved error handling, typing, and loading state management
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios, { AxiosError } from 'axios';

// User interface definition
interface User {
  id: number;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'client' | 'carrier' | 'forwarder';
  permissions: string[];
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

// Create context with undefined as initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load token from localStorage on initialization
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  // Check if token is valid and fetch user data
  const checkAuth = async (): Promise<boolean> => {
    if (!token) {
      setLoading(false);
      return false;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<{ data: User }>('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.data);
      return true;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || 'Failed to verify authentication');
      logout();
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (name: string, email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post<{ token: string; user: User }>('/api/auth/register', {
        name,
        email,
        password,
      });
      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
      setUser(newUser);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Login existing user
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post<{ token: string; user: User }>('/api/auth/login', {
        email,
        password,
      });
      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
      setUser(newUser);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await axios.post('/api/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setUser(null);
      setToken(null);
      setLoading(false);
      localStorage.removeItem('auth_token');
    }
  };

  // Derived state
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // Expose context values
  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    register,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for accessing auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};