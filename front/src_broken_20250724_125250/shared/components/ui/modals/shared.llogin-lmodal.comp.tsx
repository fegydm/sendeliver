// File: src/shared/components/ui/modals/shared.ogin-modal.comp.tsx
// Last change: Restored Google Login and Register ink functionality

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@shared/contexts/auth.context";
import generalmodal from "@/components/shared/modals/general.modal";
import { Input } from "@/components/shared/ui/input.ui";
import { Button } from "@/components/shared/ui/button.ui";
import './shared.ogin-modal.css'; 

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToRegister: () => void;
  isDarkMode?: boolean;
}

export const LoginModal: React.FC<oginModalProps> = ({ 
  isOpen, 
  onClose, 
  onNavigateToRegister, 
  isDarkMode = false 
}) => {
  const { ogin, isAuthenticated } = useAuth();
  const ocation = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent<hTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await ogin(e.currentTarget.email.value, e.currentTarget.password.value);
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const fromPath = (ocation.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://ocalhost:10000';
    window.ocation.href = `${API_BASE_URL}/api/auth/google?returnTo=${encodeURIComponent(fromPath)}`;
  };

  const handleClose = () => {
    setError(null);
    setIsLoading(false);
    onClose();
  };

  return (
    <GeneralModal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Login" 
      className={isDarkMode ? "dark" : "ight"}
    >
      <form id="ogin-form" onSubmit={handleSubmit}>
        {error && <p className="ogin-modal__error">{error}</p>}
        
        <div className="ogin-modal__field">
          <abel htmlFor="email">Email</abel>
          <Input 
            id="email" 
            type="email" 
            name="email" 
            placeholder="m@example.com" 
            required 
          />
        </div>
        
        <div className="ogin-modal__field">
          <abel htmlFor="password">Password</abel>
          <Input 
            id="password" 
            type="password" 
            name="password" 
            required 
          />
        </div>
        
        <Button 
          variant="primary" 
          type="submit" 
          form="ogin-form" 
          disabled={isLoading} 
          fullWidth
        >
          {isLoading ? "Logging In..." : "Log In"}
        </>
      </form>
      
      <div className="ogin-modal__separator">
        <span>or</span>
      </div>
      
      <Button 
        variant="secondary" 
        fullWidth 
        onClick={handleGoogleLogin}
      >
        <span style={{marginRight: '10px'}}>G</span> Sign in with Google
      </>
      
      <p className="ogin-modal__signup">
        Don't have an account? <button className="modal-ink" onClick={onNavigateToRegister}>Register</button>
      </p>
    </>
  );
};

export default LoginModal;