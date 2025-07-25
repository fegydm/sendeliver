// File: front/src/contexts/AuthContext.tsx
// Last change: Added tab manager integration and logout modal with multi-tab handling

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import axios from 'axios';
import type { TopRowType } from '@/types/dots';
import { useTabManager } from '@/hooks/useTabManager';
import LogoutModal from '@/components/shared/modals/LogoutModal';

type UserRole = 'superadmin' | 'developer' | 'org_admin' | 'dispatcher' | 'driver' | 'individual_user';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  imageUrl?: string;
  selectedRole?: TopRowType;
  emailVerified?: boolean; // ✅ SINGLE SOURCE OF TRUTH
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
  setUser: (user: User | null) => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  updateUserRole: (role: TopRowType) => Promise<void>;
  updateUserAvatar: (imageUrl: string) => Promise<void>;
  activeTabCount: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:10000';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingEmailVerification, setPendingEmailVerification] = useState<PendingVerificationInfo | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Tab manager integration
  const { activeTabCount, logoutAllTabs } = useTabManager();

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<User>(`${API_BASE_URL}/api/auth/profile`, { withCredentials: true });
      if (response.data) {
        setUser(response.data);
        // ✅ CONSISTENT NAMING
        if (response.data.emailVerified) {
          setPendingEmailVerification(null);
          localStorage.removeItem('pendingEmailVerification');
          console.debug('[AuthContext] User email verified, cleared pending verification');
        }
      }
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error('Auth profile fetch error:', err);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post<{ user: User, message: string }>(
        `${API_BASE_URL}/api/auth/register`,
        { name, email, password },
        { withCredentials: true }
      );
      // ✅ CONSISTENT NAMING
      if (response.data.user && !response.data.user.emailVerified) {
        const verification = {
          email: response.data.user.email,
          expiresAt: Date.now() + (15 * 60 * 1000)
        };
        setPendingEmailVerification(verification);
        localStorage.setItem('pendingEmailVerification', JSON.stringify(verification));
        console.debug('[AuthContext] Registered user, set pending verification:', verification);
      }
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
        // ✅ CONSISTENT NAMING
        if (!response.data.user.emailVerified) {
          setError("Váš e-mail nie je overený. Prosím, skontrolujte si schránku a overte si účet.");
          setUser(null);
          const verification = {
            email: response.data.user.email,
            expiresAt: Date.now() + (15 * 60 * 1000)
          };
          setPendingEmailVerification(verification);
          localStorage.setItem('pendingEmailVerification', JSON.stringify(verification));
          console.debug('[AuthContext] Login failed: email not verified, set pending verification:', verification);
          throw new Error("Email not verified."); 
        }
        setUser(response.data.user);
        setPendingEmailVerification(null);
        localStorage.removeItem('pendingEmailVerification');
        console.debug('[AuthContext] Login successful, cleared pending verification');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Core logout function that handles the actual logout process
  const performLogout = useCallback(async (): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout request failed, continuing with client-side logout:', err);
    } finally {
      setUser(null);
      setPendingEmailVerification(null);
      localStorage.removeItem('pendingEmailVerification');
      setShowLogoutModal(false);
      console.debug('[AuthContext] Logged out');
    }
  }, []);

  // Force logout listener for multi-tab coordination
  useEffect(() => {
    const handleForceLogout = () => {
      console.log('[AUTH_CONTEXT] Force logout triggered from another tab');
      performLogout();
    };

    window.addEventListener('forceLogout', handleForceLogout);
    return () => window.removeEventListener('forceLogout', handleForceLogout);
  }, [performLogout]);

  // Public logout function that handles multi-tab logic
  const logout = useCallback(async (): Promise<void> => {
    if (activeTabCount > 1) {
      setShowLogoutModal(true);
      return;
    }
    // Single tab - direct logout
    await performLogout();
  }, [activeTabCount, performLogout]);

  // Logout only current tab
  const logoutCurrentTab = useCallback(async (): Promise<void> => {
    await performLogout();
  }, [performLogout]);

  // Logout all tabs
  const logoutAllTabsHandler = useCallback(async (): Promise<void> => {
    // First logout from server
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout request failed:', err);
    }

    // Then broadcast to all tabs
    logoutAllTabs();

    // Finally logout current tab
    setUser(null);
    setPendingEmailVerification(null);
    localStorage.removeItem('pendingEmailVerification');
    setShowLogoutModal(false);
    console.debug('[AuthContext] Logged out from all tabs');
  }, [logoutAllTabs]);

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
  
  useEffect(() => {
    fetchUserProfile();
    const storedPending = localStorage.getItem('pendingEmailVerification');
    if (storedPending) {
      try {
        const parsedPending = JSON.parse(storedPending);
        if (parsedPending.expiresAt > Date.now()) {
          setPendingEmailVerification(parsedPending);
          console.debug('[AuthContext] Restored pending verification from localStorage:', parsedPending);
        } else {
          localStorage.removeItem('pendingEmailVerification');
          console.debug('[AuthContext] Removed expired pending verification from localStorage');
        }
      } catch (e) {
        console.error("Failed to parse pendingEmailVerification from localStorage:", e);
        localStorage.removeItem('pendingEmailVerification');
      }
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    if (pendingEmailVerification) {
      localStorage.setItem('pendingEmailVerification', JSON.stringify(pendingEmailVerification));
      console.debug('[AuthContext] Saved pending verification to localStorage:', pendingEmailVerification);
    } else {
      localStorage.removeItem('pendingEmailVerification');
      console.debug('[AuthContext] Cleared pending verification from localStorage');
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
    setUser,
    register,
    login,
    logout, // This now handles multi-tab logic
    checkAuthStatus: fetchUserProfile,
    updateUserRole,
    updateUserAvatar,
    activeTabCount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LogoutModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        activeTabCount={activeTabCount}
        onLogoutCurrent={logoutCurrentTab}
        onLogoutAll={logoutAllTabsHandler}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};