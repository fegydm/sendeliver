// .front/src/components/modals/login.modal.tsx
import React from "react";
import { Input, Button } from "@/components/ui";
import GeneralModal from "@/components/modals/general.modal";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = e.currentTarget.email.value;
    const password = e.currentTarget.password.value;

    // Login logic here
    console.log({ email, password });
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      actions={
        <Button variant="primary" type="submit" form="login-form">
          Login
        </Button>
      }
    >
      <form id="login-form" className="space-y-6" onSubmit={handleSubmit}>
        <Input
          type="email"
          name="email"
          label="Email"
          placeholder="your@email.com"
          required
        />

        <Input
          type="password"
          name="password"
          label="Password"
          placeholder="••••••••"
          required
        />
      </form>
    </GeneralModal>
  );
};

export default LoginModal;
