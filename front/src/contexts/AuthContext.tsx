// File: front/src/contexts/AuthContext.tsx
// Last change: Optimized fetchUserProfile calls to prevent excessive polling and flickering.

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import axios from 'axios';
import type { TopRowType } from '@/types/dots';

type UserRole = 'superadmin' | 'developer' | 'org_admin' | 'dispatcher' | 'driver' | 'individual_user';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  imageUrl?: string;
  selectedRole?: TopRowType;
  emailVerified?: boolean; 
}

export interface PendingVerificationInfo {
  email: string;
  expiresAt: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  pendingEmailVerification: PendingVerificationInfo | null;
  setPendingEmailVerification: (info: PendingVerificationInfo | null) => void;
  register: (name: string, email:string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  updateUserRole: (role: TopRowType) => Promise<void>;
  updateUserAvatar: (imageUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:10000';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingEmailVerification, setPendingEmailVerification] = useState<PendingVerificationInfo | null>(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<User>(`${API_BASE_URL}/api/auth/profile`, { withCredentials: true });
      if (response.data) {
        setUser(response.data);
        if (response.data.emailVerified) {
          setPendingEmailVerification(null);
        }
      }
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error('Auth profile fetch error:', err);
      }
      setUser(null);
      // Remove this block as it was causing issues with pending state persistence
      // if (pendingEmailVerification && err.response?.status === 401) {
      //     // Keep pending state if user is logged out but waiting for email verification
      // } else {
      //    setPendingEmailVerification(null);
      // }
    } finally {
      setLoading(false);
    }
  }, []); // fetchUserProfile itself doesn't need pendingEmailVerification in its deps

  const register = useCallback(async (name: string, email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await axios.post<{ user: User, message: string }>(
        `${API_BASE_URL}/api/auth/register`,
        { name, email, password },
        { withCredentials: true }
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed.");
      throw err;
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
        if (!response.data.user.emailVerified) {
          setError("Váš e-mail nie je overený. Prosím, skontrolujte si schránku a overte si účet.");
          setUser(null);
          throw new Error("Email not verified."); 
        }
        setUser(response.data.user);
        setPendingEmailVerification(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed.");
      throw err;
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
      setPendingEmailVerification(null); 
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

  const updateUserAvatar = useCallback(async (imageUrl: string) => {
    if (!user) return;
    const previousUser = user;
    setUser(currentUser => currentUser ? { ...currentUser, imageUrl: imageUrl } : null);
    try {
      await axios.patch(`${API_BASE_URL}/api/auth/me/avatar`, { imageUrl: imageUrl }, { withCredentials: true });
    } catch (err) {
      console.error("Failed to update user avatar:", err);
      setUser(previousUser);
      throw err;
    }
  }, [user]);
  
  // --- ZMENA TU: Optimalizácia volania fetchUserProfile ---
  useEffect(() => {
    // Voláme fetchUserProfile iba raz pri prvom načítaní komponentu
    fetchUserProfile();

    // Načítanie pendingEmailVerification zo `localStorage` pri štarte, ak používateľ refresne stránku
    const storedPending = localStorage.getItem('pendingEmailVerification');
    if (storedPending) {
        try {
            const parsedPending = JSON.parse(storedPending);
            // Overíme, či čas ešte nevypršal
            if (parsedPending.expiresAt > Date.now()) {
                setPendingEmailVerification(parsedPending);
            } else {
                localStorage.removeItem('pendingEmailVerification'); // Vypršal, odstránime
            }
        } catch (e) {
            console.error("Failed to parse pendingEmailVerification from localStorage:", e);
            localStorage.removeItem('pendingEmailVerification');
        }
    }
    // Tento useEffect má prázdne pole závislostí, čo znamená, že sa spustí len raz pri mountovaní.
    // fetchUserProfile je už useCallback, takže sa jeho referencia nemení.
  }, []); // Prázdne pole závislostí

  // Ukladanie pendingEmailVerification do localStorage pri zmene
  useEffect(() => {
    if (pendingEmailVerification) {
        localStorage.setItem('pendingEmailVerification', JSON.stringify(pendingEmailVerification));
    } else {
        localStorage.removeItem('pendingEmailVerification');
    }
  }, [pendingEmailVerification]);


  const isAuthenticated = !loading && !!user;
  const isAdmin = !loading && (user?.role === 'superadmin' || user?.role === 'org_admin');

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    pendingEmailVerification,
    setPendingEmailVerification,
    register,
    login,
    logout,
    checkAuthStatus: fetchUserProfile,
    updateUserRole,
    updateUserAvatar,
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
