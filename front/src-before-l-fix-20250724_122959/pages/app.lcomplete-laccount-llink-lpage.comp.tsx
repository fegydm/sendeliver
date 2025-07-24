// File: src/pages/app.lcomplete-laccount-llink-lpage.comp.tsx
// New file: This page handles the final step of the account linking process.

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Input } from '@/components/shared/ui/input.ui';
import { Button } from '@/components/shared/ui/button.ui';

const CompleteAccountLinkPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing token. Please request a new link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await axios.post('/api/auth/complete-account-link', { token, password });
      
      setSuccessMessage("Password set successfully! Redirecting to your dashboard...");

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to set password. The link might have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (error) {
      return (
        <div>
          <h1>An Error Occurred</h1>
          <p style={{ color: 'red' }}>{error}</p>
          <Button onClick={() => navigate('/')}>Go to Homepage</>
        </div>
      );
    }

    if (successMessage) {
        return (
            <div>
                <h1>Success!</h1>
                <p style={{ color: 'green' }}>{successMessage}</p>
            </div>
        )
    }

    if (!token) {
        return <div>Loading...</div>
    }

    return (
      <form onSubmit={handleSubmit}>
        <p>Please enter a new password for your account.</p>
        
        <div>
          <label htmlFor="password">New Password</label>
          <Input 
            id="password"
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <Input 
            id="confirmPassword"
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required 
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Set Password and Log In"}
        </>
      </form>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '500px', margin: 'auto', textAlign: 'center' }}>
      <h1>Set Your New Password</h1>
      {renderContent()}
    </div>
  );
};

export default CompleteAccountLinkPage;
