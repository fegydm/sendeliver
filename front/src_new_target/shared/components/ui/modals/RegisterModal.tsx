// File: front/src/components/shared/modals/RegisterModal.tsx
// Last change: Adjusted registration flow to set pending email verification status and close modal without auto-login.

import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@shared/contexts/AuthContext";
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
  const { register, setPendingEmailVerification } = useAuth(); // Destructure setPendingEmailVerification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    vatNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRegType, setSelectedRegType] = useState<'individual' | 'organization'>('individual'); 

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isValid) { 
      setError(passwordError || confirmPasswordError || "Please check your password entries.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      if (selectedRegType === 'individual') {
        await register(formData.name, formData.email, formData.password);
        
        // After successful registration, set the pending email verification status
        // Assuming the verification link expires in 15 minutes (900 seconds)
        const expiresAt = Date.now() + (15 * 60 * 1000); // 15 minutes in milliseconds
        setPendingEmailVerification({ email: formData.email, expiresAt: expiresAt });

        onClose(); // Close the modal
        // Reset form data after successful submission
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            organizationName: '',
            vatNumber: '',
        });
      } else if (selectedRegType === 'organization') {
        await axios.post('/api/auth/register-organization', {
          organizationName: formData.organizationName,
          vatNumber: formData.vatNumber,
          adminEmail: formData.email,
          adminPassword: formData.password,
          adminName: formData.name 
        });
        setError("Organization registered! Please check your email for verification.");
        onClose(); 
        // Reset form data after successful submission
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            organizationName: '',
            vatNumber: '',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create a New Account"
      description="Choose your account type to get started."
    >
      <div className="register-form__type-selection mb-4 flex justify-center space-x-4">
        <button
          type="button"
          className={`px-6 py-3 rounded-lg border-2 transition-all duration-200 text-center flex-1 
            ${selectedRegType === 'individual' ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-md' : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'}`}
          onClick={() => setSelectedRegType('individual')}
        >
          <div>
            <h3 className="font-semibold text-base">Individual Account</h3>
            <p className="text-xs text-gray-500">For personal use or single deliveries.</p>
          </div>
        </button>

        <button
          type="button"
          className={`px-6 py-3 rounded-lg border-2 transition-all duration-200 text-center flex-1 
            ${selectedRegType === 'organization' ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-md' : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'}`}
          onClick={() => setSelectedRegType('organization')}
        >
          <div>
            <h3 className="font-semibold text-base">Organization Account</h3>
            <p className="text-xs text-gray-500">For businesses, fleets, and teams.</p>
          </div>
        </button>
      </div>

      <form id="register-form" className="register-form" onSubmit={handleSubmit}>
        {error && <p className="register-form__error">{error}</p>}
        
        {selectedRegType === 'organization' && (
          <>
            <div className="register-form__field">
              <label htmlFor="organizationName">Organization Name</label>
              <Input id="organizationName" name="organizationName" type="text" value={formData.organizationName} onChange={handleChange} required />
            </div>
            <div className="register-form__field">
              <label htmlFor="vatNumber">VAT Number (Optional)</label>
              <Input id="vatNumber" name="vatNumber" type="text" value={formData.vatNumber} onChange={handleChange} />
            </div>
          </>
        )}

        <div className="register-form__field">
          <label htmlFor="name">{selectedRegType === 'individual' ? 'Your Name' : 'Admin Name'}</label>
          <Input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="register-form__field">
          <label htmlFor="email">{selectedRegType === 'individual' ? 'Your Email' : 'Admin Email'}</label>
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
          <Button variant="primary" type="submit" form="register-form" disabled={isLoading || !isValid || (selectedRegType === 'organization' && !formData.organizationName)}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </div>
      </form>

      <div className="mt-4 text-center text-gray-600 text-sm">
        <p>Are you part of an organization and received an invitation or want to connect?</p>
        <button 
          type="button" 
          onClick={() => { /* TODO: Implement logic to open a dedicated "Connect to Organization" modal or navigate to a page */ }} 
          className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={isLoading}
        >
          Connect to an Organization
        </button>
      </div>

    </GeneralModal>
  );
};

export default RegisterModal;
