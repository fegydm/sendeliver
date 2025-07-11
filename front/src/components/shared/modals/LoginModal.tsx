// File: front/src/components/shared/modals/LoginModal.tsx
// Last action: Added auto-close functionality when user becomes authenticated

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/shared/ui/button.ui";
import { Input } from "@/components/shared/ui/input.ui";
import GeneralModal from "@/components/shared/modals/general.modal";
import './LoginModal.css'; 

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, isDarkMode = false }) => {
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-close modal when user becomes authenticated
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
      // onClose() will be called automatically via useEffect when isAuthenticated becomes true
    } catch (err: any) {
      setError(err.message || "Prihlásenie zlyhalo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend OAuth flow
    const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:10000';
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  // Reset form when modal closes
  const handleClose = () => {
    setError(null);
    setIsLoading(false);
    onClose();
  };

  return (
    <GeneralModal isOpen={isOpen} onClose={handleClose} title="Login" className={isDarkMode ? "dark" : "light"}>
      <form id="login-form" onSubmit={handleSubmit}>
        {error && <p className="login-modal__error">{error}</p>}
        <div className="login-modal__field">
          <label htmlFor="email">Email</label>
          <Input id="email" type="email" name="email" placeholder="m@example.com" required />
        </div>
        <div className="login-modal__field">
          <label htmlFor="password">Heslo</label>
          <Input id="password" type="password" name="password" required />
        </div>
        <Button variant="primary" type="submit" form="login-form" disabled={isLoading} fullWidth>
          {isLoading ? "Prihlasujem..." : "Prihlásiť sa"}
        </Button>
      </form>

      <div className="login-modal__separator">
        <span>alebo</span>
      </div>

      <Button variant="secondary" fullWidth onClick={handleGoogleLogin}>
        <span style={{marginRight: '10px'}}>G</span> Prihlásiť sa cez Google
      </Button>
      
      <p className="login-modal__signup">
        Nemáte účet? <a href="#">Zaregistrujte sa</a>
      </p>
    </GeneralModal>
  );
};

export default LoginModal;