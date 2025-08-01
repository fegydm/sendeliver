// File: front/src/contexts/auth.context.tsx
// Last change: Fixed the console error caused by React Strict Mode and Fetch API.

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import type { TopRowType } from '@/types/declarations/dots';
import { useTabManager } from '@/hooks/useTabManager';
import LogoutModal from '@/shared/modals/logout.modal';

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

// Helper function to handle Fetch API responses
const handleFetchResponse = async (response: Response): Promise<any> => {
  if (response.status === 401) {
    console.debug('[AuthContext] Handle Fetch Response: Status 401, returning null.');
    return null;
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `Request failed with status: ${response.status}`);
  }
  
  return response.json();
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingEmailVerification, setPendingEmailVerification] = useState<PendingVerificationInfo | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { activeTabCount, logoutAllTabs } = useTabManager();

  const fetchUserProfile = useCallback(async () => {
    // 🎯 Use AbortController for cleanup
    const controller = new AbortController();
    const { signal } = controller;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: signal, // Attach the abort signal
      });

      const data = await handleFetchResponse(response);

      if (data) {
        setUser(data);
        if (data.emailVerified) {
          setPendingEmailVerification(null);
          localStorage.removeItem('pendingEmailVerification');
          console.debug('[AuthContext] User email verified, cleared pending verification');
        }
      } else if (response.status === 401) {
        console.debug('[AuthContext] User is not authenticated (401), setting user to null.');
        setUser(null);
      }
    } catch (err: any) {
      // 🎯 Catch AbortError specifically to prevent console errors
      if (err.name === 'AbortError') {
        console.log('[AuthContext] Fetch aborted successfully.');
        return;
      }
      
      console.error('Error fetching user profile:', err);
      setError(err.message || 'Failed to fetch user profile.');
      setUser(null);
    } finally {
      if (signal.aborted) {
        // Prevent setting loading state if the request was aborted.
        return;
      }
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include',
      });
      
      const data = await handleFetchResponse(response);

      if (data && !data.user.emailVerified) {
        const verification = {
          email: data.user.email,
          expiresAt: Date.now() + (15 * 60 * 1000)
        };
        setPendingEmailVerification(verification);
        localStorage.setItem('pendingEmailVerification', JSON.stringify(verification));
        console.debug('[AuthContext] Registered user, set pending verification:', verification);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      const data = await handleFetchResponse(response);

      if (data && data.user) {
        if (!data.user.emailVerified) {
          setError("Váš e-mail nie je overený. Prosím, skontrolujte si schránku a overte si účet.");
          setUser(null);
          const verification = {
            email: data.user.email,
            expiresAt: Date.now() + (15 * 60 * 1000)
          };
          setPendingEmailVerification(verification);
          localStorage.setItem('pendingEmailVerification', JSON.stringify(verification));
          console.debug('[AuthContext] Login failed: email not verified, set pending verification:', verification);
          throw new Error("Email not verified.");
        }
        setUser(data.user);
        setPendingEmailVerification(null);
        localStorage.removeItem('pendingEmailVerification');
        console.debug('[AuthContext] Login successful, cleared pending verification');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const performLogout = useCallback(async (): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
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
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
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
      const response = await fetch(`${API_BASE_URL}/api/auth/me/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedRole: role }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user role.');
      }
    } catch (err: any) {
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
      const response = await fetch(`${API_BASE_URL}/api/auth/me/avatar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: imageUrl }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user avatar.');
      }
    } catch (err: any) {
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