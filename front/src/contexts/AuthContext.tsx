// File: front/src/contexts/AuthContext.tsx
// Last action: Added optional 'image' property to the User interface.

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'client' | 'carrier' | 'forwarder';
  permissions: string[];
  image?: string; // Pridaná voliteľná vlastnosť pre URL profilového obrázku
}

export interface AuthContextType {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      checkAuth(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async (currentToken?: string): Promise<boolean> => {
    const tokenToCheck = currentToken || token;
    if (!tokenToCheck) {
      setLoading(false);
      return false;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<{ data: User }>('/api/auth/me', {
        headers: { Authorization: `Bearer ${tokenToCheck}` },
      });
      setUser(response.data.data);
      return true;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || 'Failed to verify authentication');
      await logout(); // Changed to await logout
      return false;
    } finally {
      setLoading(false);
    }
  };

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
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(newUser);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

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
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(newUser);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (token) {
        await axios.post('/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setUser(null);
      setToken(null);
      setLoading(false);
      localStorage.removeItem('auth_token');
      delete axios.defaults.headers.common['Authorization'];
    }
  };
  
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

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
    checkAuth: () => checkAuth(),
  };

 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};