// File: .front/src/components/modals/LoginModal.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button.ui";
import { Input } from "@/components/ui/input.ui";
import GeneralModal from "@/components/modals/general.modal";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean; // Pridané
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, isDarkMode = false }) => {
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const email = e.currentTarget.email.value;
    const password = e.currentTarget.password.value;
    try {
      console.log({ email, password });
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="Login"
      description="Enter your email below to login to your account"
      className={isDarkMode ? "dark" : "light"} // Dynamicky podľa isDarkMode
    >
      <form id="login-form" onSubmit={handleSubmit}>
        <div className="login-modal__field">
          <label htmlFor="email" className="login-modal__label">
            Email
          </label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="m@example.com"
            required
          />
        </div>
        <div className="login-modal__field">
          <div className="login-modal__password-header">
            <label htmlFor="password" className="login-modal__label">
              Password
            </label>
            <a href="#" className="login-modal__forgot-link">
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            name="password"
            required
          />
        </div>
        <div className="modal__actions">
          <Button variant="cancel" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="login-form"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </div>
      </form>
      <Button variant="secondary" fullWidth disabled>
        Login with Google
      </Button>
      <p className="login-modal__signup">
        Don't have an account?{" "}
        <a href="#" className="login-modal__signup-link">
          Sign up
        </a>
      </p>
    </GeneralModal>
  );
};

export default LoginModal;