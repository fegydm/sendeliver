// File: front/src/contexts/AuthContext.tsx
// Last action: Updated User interface and authentication logic for consistency with backend.
//              Fixed 'process is not defined' error by using import.meta.env for Vite.

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import axios, { AxiosError } from 'axios';

// Define UserRole type to match Prisma enum for consistency
type UserRole = 'superadmin' | 'developer' | 'org_admin' | 'dispatcher' | 'driver' | 'individual_user';

export interface User {
  id: number;
  displayName: string;
  email: string;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  register: (displayName: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// POUŽITE import.meta.env pre premenné prostredia vo Vite
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:10000';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    console.log('[AuthContext] Checking auth status...');
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<User>(`${API_BASE_URL}/api/auth/profile`, { withCredentials: true });
      console.log('[AuthContext] User profile fetched successfully:', response.data);
      if (response.data) {
        setUser(response.data);
      }
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>;
      console.error('[AuthContext] Failed to fetch user profile. Error:', error.response?.data?.error || error.message);
      setUser(null);
    } finally {
      setLoading(false);
      // console.log('[AuthContext] Auth check finished. IsAuthenticated:', !!user); // user might be null here
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post<{ user: User, token: string }>(`${API_BASE_URL}/api/auth/login`, { email, password }, { withCredentials: true });
      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      const errorMessage = err.response?.data?.error || 'Prihlásenie zlyhalo.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (displayName: string, email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post<{ user: User, token: string }>(`${API_BASE_URL}/api/auth/register`, {
        displayName,
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

  const logout = useCallback(async (): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'superadmin' || user?.role === 'org_admin';

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
