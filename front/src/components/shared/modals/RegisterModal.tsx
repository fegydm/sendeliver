// File: front/src/components/shared/modals/RegisterModal.tsx
// Last change: Integrated the usePasswordValidation hook and cleaned up

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import GeneralModal from "@/components/shared/modals/general.modal";
import { Input } from "@/components/shared/ui/input.ui";
import { Button } from "@/components/shared/ui/button.ui";
import "./RegisterModal.css";
import usePasswordValidation from '@/hooks/usePasswordValidation';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EyeIcon = ({ closed }: { closed: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {closed ? (
      <>
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
        <line x1="2" x2="22" y1="2" y2="22"></line>
      </>
    ) : (
      <>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </>
    )}
  </svg>
);

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showAccountLinkOption, setShowAccountLinkOption] = useState(false);

  const { passwordError, confirmPasswordError, isValid } = usePasswordValidation(
    formData.password,
    formData.confirmPassword,
    {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireDigit: true,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRequestLink = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.post('/api/auth/request-account-link', { email: formData.email });
      setError("Success! We've sent a verification link to your email. Please check your inbox.");
      setShowAccountLinkOption(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isValid) {
      setError(passwordError || confirmPasswordError || "Please check your password entries.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setShowAccountLinkOption(false);

    try {
      await register(formData.name, formData.email, formData.password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      if (err.response?.data?.errorCode === 'USER_EXISTS_SOCIAL_LOGIN') {
        setError("This account already exists and is linked with Google.");
        setShowAccountLinkOption(true);
      } else {
        setError(err.response?.data?.message || "Registration failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create a New Account"
      description="Register to get access to our platform."
    >
      <form id="register-form" className="register-form" onSubmit={handleSubmit}>
        {error && <p className="register-form__error">{error}</p>}
        
        {showAccountLinkOption && (
          <div className="register-form__link-account">
            <p>Would you like to add a password to log in manually?</p>
            <Button variant="secondary" type="button" onClick={handleRequestLink} disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Verification Link"}
            </Button>
            <hr className="my-4"/>
          </div>
        )}
        
        <div className="register-form__field">
          <label htmlFor="name">Name</label>
          <Input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="register-form__field">
          <label htmlFor="email">Email</label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        
        <div className="register-form__field register-form__field--password">
          <label htmlFor="password">Password</label>
          <Input 
            id="password" 
            name="password" 
            type={showPassword ? "text" : "password"} 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />
          <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
            <EyeIcon closed={showPassword} />
          </button>
          {passwordError && <p className="register-form__error-inline">{passwordError}</p>}
        </div>
        
        <div className="register-form__field register-form__field--password">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <Input 
            id="confirmPassword" 
            name="confirmPassword" 
            type={showPassword ? "text" : "password"} 
            value={formData.confirmPassword} 
            onChange={handleChange} 
            required 
          />
          {confirmPasswordError && <p className="register-form__error-inline">{confirmPasswordError}</p>}
        </div>
        
        <div className="register-form__actions">
          <Button variant="cancel" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="register-form" disabled={isLoading || !isValid}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </div>
      </form>
    </GeneralModal>
  );
};

export default RegisterModal;