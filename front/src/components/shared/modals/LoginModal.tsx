// File: front/src/components/shared/modals/LoginModal.tsx
// Last action: Cleaned up component and verified for new auth system.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import GeneralModal from "@/components/shared/modals/general.modal";
import { Input } from "@/components/shared/ui/input.ui";
import { Button } from "@/components/shared/ui/button.ui";
import "./RegisterModal.css"; 

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(formData.email, formData.password);
      onClose();
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="Log In"
      description="Welcome back! Please enter your details to continue."
    >
      <form id="login-form" className="register-form" onSubmit={handleSubmit}>
        {error && <p className="register-form__error">{error}</p>}
        
        <div className="register-form__field">
          <label htmlFor="login-email">Email</label>
          <Input id="login-email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        
        <div className="register-form__field">
          <label htmlFor="login-password">Password</label>
          <Input id="login-password" name="password" type="password" value={formData.password} onChange={handleChange} required />
        </div>
        
        <div className="register-form__actions">
          <Button variant="cancel" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="login-form" disabled={isLoading}>
            {isLoading ? "Logging In..." : "Log In"}
          </Button>
        </div>
      </form>
    </GeneralModal>
  );
};

export default LoginModal;
