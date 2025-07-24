// File: src/features/auth/components/app.lauth-lview.comp.tsx
// Last action: Fixed type imports and props destructuring.

import react from 'react';
import { useAuth } from '@shared/contexts/auth.context';
import type { User } from '@shared/contexts/auth.context';

interface AuthViewProps {
  viewForAuthenticated: (user: User) => React.ReactNode; 
  viewForGuest: React.ReactNode; 
}

const AuthView: React.FC<authViewProps> = ({ viewForAuthenticated, viewForGuest }) => {
  const { isAuthenticated, user } = useAuth();

  return isAuthenticated && user ? <>{viewForAuthenticated(user)}</> : <>{viewForGuest}</>;
};

export default AuthView;