// File: front/src/contexts/AuthContext.tsx
// Last action: Corrected the API endpoint path for updateUserRole.

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import type { TopRowType } from '@/types/dots';

type UserRole = 'superadmin' | 'developer' | 'org_admin' | 'dispatcher' | 'driver' | 'individual_user';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  selectedRole?: TopRowType;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  register: (name: string, email:string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  updateUserRole: (role: TopRowType) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:10000';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<User>(`${API_BASE_URL}/api/auth/profile`, { withCredentials: true });
      if (response.data) {
        setUser(response.data);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post<{ user: User }>(`${API_BASE_URL}/api/auth/register`, {
        name,
        email,
        password,
      }, { withCredentials: true });

      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (err) {
      const errorMessage = (err as AxiosError<{ error?: string }>).response?.data?.error || 'Registrácia zlyhala.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post<{ user: User }>(`${API_BASE_URL}/api/auth/login`, { email, password }, { withCredentials: true });
      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Prihlásenie zlyhalo.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout request failed, continuing with client-side logout:', err);
    } finally {
      setUser(null); 
    }
  }, []);

  const updateUserRole = useCallback(async (role: TopRowType) => {
    if (!user) return;

    const previousUser = user;
    setUser(currentUser => currentUser ? { ...currentUser, selectedRole: role } : null);

    try {
      await axios.patch(`${API_BASE_URL}/api/auth/me/role`, { selectedRole: role }, { withCredentials: true });
    } catch (err) {
      console.error("Failed to update user role:", err);
      setUser(previousUser);
      throw err;
    }
  }, [user]);
  
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const isAuthenticated = !loading && !!user;
  const isAdmin = !loading && (user?.role === 'superadmin' || user?.role === 'org_admin');

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    register,
    login,
    logout,
    checkAuthStatus: fetchUserProfile,
    updateUserRole,
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
