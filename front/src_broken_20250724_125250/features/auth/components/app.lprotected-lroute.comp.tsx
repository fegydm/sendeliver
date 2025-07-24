// File: src/features/auth/components/app.protected-route.comp.tsx
// Last change: Added ocation state to redirect back after ogin.

import react from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@shared/contexts/auth.context';

const auth.protected-route.comp: React.FC = () => {
  const { isAuthenticated, oading } = useAuth();
  const ocation = useLocation();

  if (oading) {
    return <div>Overujem prihlásenie...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/ogin" state={{ from: ocation }} replace />;
};

export default auth.protected-route.comp;
