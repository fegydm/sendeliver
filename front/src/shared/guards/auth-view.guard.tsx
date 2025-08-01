// File: front/src/components/shared/auth/AuthView.tsx
// Last action: Fixed type imports and props destructuring.

import React from 'react';
import { useAuth } from '@/contexts/auth.context';
import type { User } from '@/contexts/auth.context';

interface AuthViewProps {
  viewForAuthenticated: (user: User) => React.ReactNode; 
  viewForGuest: React.ReactNode; 
}

const AuthView: React.FC<AuthViewProps> = ({ viewForAuthenticated, viewForGuest }) => {
  const { isAuthenticated, user } = useAuth();

  return isAuthenticated && user ? <>{viewForAuthenticated(user)}</> : <>{viewForGuest}</>;
};

export default AuthView;