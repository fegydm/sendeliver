// File: front/src/contexts/AuthContext.tsx
// Last change: Fixed 401 Unauthorized error handling to prevent console errors.

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import type { TopRowType } from '@/types/declarations/dots';
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

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:10001';

// Custom error handling function for Axios responses.
// Returns an error message, but returns null for 401 errors to signal that they are not critical.
const handleApiError = (err: any): string | null => {
  if (axios.isAxiosError(err) && err.response) {
    if (err.response.status === 401) {
      // 401 is an expected state, not a critical error.
      return null;
    }
    return err.response.data?.message || `Request failed with status code ${err.response.status}`;
  }
  return err.message || 'An unexpected error occurred.';
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingEmailVerification, setPendingEmailVerification] = useState<PendingVerificationInfo | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { activeTabCount, logoutAllTabs } = useTabManager();

   const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[AuthContext] Fetching user profile...');
      
      // We explicitly tell Axios not to throw an error for 401 status codes.
      const response = await axios.get<User>(`${API_BASE_URL}/api/auth/profile`, { 
        withCredentials: true,
        validateStatus: (status) => {
          console.log(`[AuthContext] Axios: Validating status code ${status}`);
          return status === 200 || status === 401;
        }
      });

      console.log(`[AuthContext] Axios: Response received with status ${response.status}`);

      if (response.status === 200) {
        if (response.data) {
          setUser(response.data);
          if (response.data.emailVerified) {
            setPendingEmailVerification(null);
            localStorage.removeItem('pendingEmailVerification');
            console.debug('[AuthContext] User email verified, cleared pending verification');
          }
        }
      } else if (response.status === 401) {
        console.log('[AuthContext] Axios: User is not authenticated (401), setting user to null.');
        setUser(null);
      }
    } catch (err: any) {
      console.error('[AuthContext] Axios: Catch block was triggered!', err);
      // The catch block should now only handle true errors (e.g., network issues)
      const apiError = handleApiError(err);
      if (apiError) {
        setError(apiError);
        console.error('Auth profile fetch error:', apiError);
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
      const apiError = handleApiError(err);
      if (apiError) {
        setError(apiError);
        console.error('Registration failed:', apiError);
        throw new Error(apiError);
      }
      throw new Error("Registration failed.");
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
      const apiError = handleApiError(err);
      if (apiError) {
        setError(apiError);
        console.error('Login failed:', apiError);
        throw new Error(apiError);
      }
      throw new Error("Login failed.");
    } finally {
      setLoading(false);
    }
  }, []);

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

  const logout = useCallback(async (): Promise<void> => {
    if (activeTabCount > 1) {
      setShowLogoutModal(true);
      return;
    }
    await performLogout();
  }, [activeTabCount, performLogout]);

  const logoutCurrentTab = useCallback(async (): Promise<void> => {
    await performLogout();
  }, [performLogout]);

  const logoutAllTabsHandler = useCallback(async (): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout request failed:', err);
    }
    logoutAllTabs();
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
    } catch (err: any) {
      const apiError = handleApiError(err);
      if (apiError) {
        console.error("Failed to update user role:", apiError);
        setUser(previousUser);
        throw new Error(apiError);
      }
      setUser(previousUser);
      throw new Error("Failed to update user role.");
    }
  }, [user]);

  const updateUserAvatar = useCallback(async (imageUrl: string) => {
    if (!user) return;
    const previousUser = user;
    setUser(currentUser => currentUser ? { ...currentUser, imageUrl: imageUrl } : null);
    try {
      await axios.patch(`${API_BASE_URL}/api/auth/me/avatar`, { imageUrl: imageUrl }, { withCredentials: true });
    } catch (err: any) {
      const apiError = handleApiError(err);
      if (apiError) {
        console.error("Failed to update user avatar:", apiError);
        setUser(previousUser);
        throw new Error(apiError);
      }
      setUser(previousUser);
      throw new Error("Failed to update user avatar.");
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
    logout,
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