// File: .front/src/components/modals/LoginModal.tsx
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button.ui";
import { Input } from "@/components/ui/input.ui";
import GeneralModal from "@/components/modals/general.modal";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
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
      variant="default"
      className="dark"
    >
      <div className={cn("flex flex-col gap-6")}>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <form id="login-form" className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">
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
          <div className="grid gap-2">
            <div className="flex items-center">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <a
                href="#"
                className="ml-auto text-sm underline-offset-4 hover:underline text-muted-foreground"
              >
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
        <div className="flex flex-col gap-4">
          <Button variant="secondary" className="w-full" disabled>
            Login with Google
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a href="#" className="underline underline-offset-4 hover:text-foreground">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </GeneralModal>
  );
};

export default LoginModal;