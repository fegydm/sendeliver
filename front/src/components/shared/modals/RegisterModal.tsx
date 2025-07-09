// File: front/src/components/shared/modals/RegisterModal.tsx
// Last action: Refactored to use GeneralModal, AuthContext, and BEM.

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import GeneralModal from "./general.modal";
import { Input } from "../ui/input.ui";
import { Button } from "../ui/button.ui";
import "./RegisterModal.css";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Heslá sa nezhodujú.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      await register(formData.name, formData.email, formData.password);
      onClose(); // Po úspešnej registrácii zatvoríme okno
    } catch (err: any) {
      setError(err.message || "Registrácia zlyhala.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="Vytvoriť Nový Účet"
      description="Zaregistrujte sa a získajte prístup k platforme Logistar."
    >
      <form id="register-form" className="register-form" onSubmit={handleSubmit}>
        {error && <p className="register-form__error">{error}</p>}
        
        <div className="register-form__field">
          <label htmlFor="name">Meno / Názov firmy</label>
          <Input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="register-form__field">
          <label htmlFor="email">Email</label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        
        <div className="register-form__field">
          <label htmlFor="password">Heslo</label>
          <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
        </div>
        
        <div className="register-form__field">
          <label htmlFor="confirmPassword">Potvrdenie Hesla</label>
          <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
        </div>
        
        <div className="register-form__actions">
          <Button variant="cancel" type="button" onClick={onClose} disabled={isLoading}>
            Zrušiť
          </Button>
          <Button variant="primary" type="submit" form="register-form" disabled={isLoading}>
            {isLoading ? "Registrujem..." : "Vytvoriť účet"}
          </Button>
        </div>
      </form>
    </GeneralModal>
  );
};

export default RegisterModal;