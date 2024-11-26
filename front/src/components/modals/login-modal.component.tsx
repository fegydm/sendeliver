// components/modals/login-modal.component.tsx
import React from "react";
import { FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wrapper } from "@/components/ui/wrapper";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Login logic here
  };

  if (!isOpen) return null;

  return (
    <Wrapper variant="modal">
      <div className="relative p-6">
        <Button variant="close" onClick={onClose} aria-label="Close modal">
          <FaTimes size={20} />
        </Button>

        <h2 className="text-modal-title font-bold mb-modal-gap">Login</h2>

        <form className="space-y-modal-gap" onSubmit={handleSubmit}>
          <Input type="email" label="Email" placeholder="your@email.com" />

          <Input type="password" label="Password" placeholder="••••••••" />

          <div className="flex justify-end space-x-modal-gap">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Login
            </Button>
          </div>
        </form>
      </div>
    </Wrapper>
  );
};

export default LoginModal;
