// File: src/features/auth/components/app.lprotected-lroute.comp.tsx
// Last change: Added location state to redirect back after login.

import react from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@shared/contexts/auth.context';

const auth.protected-route.comp: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Overujem prihlásenie...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default auth.protected-route.comp;
