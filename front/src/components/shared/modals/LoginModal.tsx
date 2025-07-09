// File: front/src/components/shared/modals/LoginModal.tsx
// Posledná akcia: Pridané tlačidlo a logika pre "Login with Google".

import React, { useState } from "react";
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
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(e.currentTarget.email.value, e.currentTarget.password.value);
      onClose();
    } catch (err: any) {
      setError(err.message || "Prihlásenie zlyhalo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Toto presmeruje používateľa na tvoj backend, ktorý začne OAuth flow
    window.location.href = 'http://localhost:10000/api/auth/google';
  };

  return (
    <GeneralModal isOpen={isOpen} onClose={onClose} title="Login" className={isDarkMode ? "dark" : "light"}>
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
        {/* Tu môže byť SVG ikona Googlu */}
        <span style={{marginRight: '10px'}}>G</span> Prihlásiť sa cez Google
      </Button>
      
      <p className="login-modal__signup">
        Nemáte účet? <a href="#">Zaregistrujte sa</a>
      </p>
    </GeneralModal>
  );
};

export default LoginModal;