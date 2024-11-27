// components/modals/login-modal.component.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GeneralModal from "@/components/modals/general-modal.component";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Login logic here
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="Login"
      theme="default" // Optional, based on your implementation
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Email Input */}
        <Input
          type="email"
          label="Email"
          placeholder="your@email.com"
          required
        />

        {/* Password Input */}
        <Input
          type="password"
          label="Password"
          placeholder="••••••••"
          required
        />

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Login
          </Button>
        </div>
      </form>
    </GeneralModal>
  );
};

export default LoginModal;
