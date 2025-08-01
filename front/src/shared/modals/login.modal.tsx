// File: front/src/shared/modals/login.modal.tsx
// Last change: Restored Google Login and Register link functionality

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth.context";
import GeneralModal from "@/shared/modals/general.modal";
import { Input } from "@/shared/ui/input.ui";
import { Button } from "@/shared/ui/button.ui";
import './login.modal.css'; 

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToRegister: () => void;
  isDarkMode?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onNavigateToRegister, 
  isDarkMode = false 
}) => {
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await login(e.currentTarget.email.value, e.currentTarget.password.value);
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:10000';
    window.location.href = `${API_BASE_URL}/api/auth/google?returnTo=${encodeURIComponent(fromPath)}`;
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
      className={isDarkMode ? "dark" : "light"}
    >
      <form id="login-form" onSubmit={handleSubmit}>
        {error && <p className="login-modal__error">{error}</p>}
        
        <div className="login-modal__field">
          <label htmlFor="email">Email</label>
          <Input 
            id="email" 
            type="email" 
            name="email" 
            placeholder="m@example.com" 
            required 
          />
        </div>
        
        <div className="login-modal__field">
          <label htmlFor="password">Password</label>
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
          form="login-form" 
          disabled={isLoading} 
          fullWidth
        >
          {isLoading ? "Logging In..." : "Log In"}
        </Button>
      </form>
      
      <div className="login-modal__separator">
        <span>or</span>
      </div>
      
      <Button 
        variant="secondary" 
        fullWidth 
        onClick={handleGoogleLogin}
      >
        <span style={{marginRight: '10px'}}>G</span> Sign in with Google
      </Button>
      
      <p className="login-modal__signup">
        Don't have an account? <button className="modal-link" onClick={onNavigateToRegister}>Register</button>
      </p>
    </GeneralModal>
  );
};

export default LoginModal;