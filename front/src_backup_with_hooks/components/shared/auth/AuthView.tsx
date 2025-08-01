// File: front/src/components/shared/auth/AuthView.tsx
// Last action: Fixed type imports and props destructuring.

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/contexts/AuthContext';

interface AuthViewProps {
  viewForAuthenticated: (user: User) => React.ReactNode; 
  viewForGuest: React.ReactNode; 
}

const AuthView: React.FC<AuthViewProps> = ({ viewForAuthenticated, viewForGuest }) => {
  const { isAuthenticated, user } = useAuth();

  return isAuthenticated && user ? <>{viewForAuthenticated(user)}</> : <>{viewForGuest}</>;
};

export default AuthView;