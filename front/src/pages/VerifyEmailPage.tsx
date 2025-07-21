// File: front/src/pages/VerifyEmailPage.tsx
// Last change: Refined exit strategy to avoid auto-redirects and prevent infinite loops.

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Keep useNavigate for manual "Go to Login" button
import axios from 'axios';
import { Button } from '@/components/shared/ui/button.ui';

interface VerifyEmailPageProps {
  // No specific props needed as it reads from URL.
}

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:10000';

const VerifyEmailPage: React.FC<VerifyEmailPageProps> = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Keep for manual navigation button
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Overujem váš e-mail...');
  const [showManualCloseInstruction, setShowManualCloseInstruction] = useState(false);
  const [showLoginButton, setShowLoginButton] = useState(false); // New state for "Go to Login" button

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    let token = queryParams.get('token');

    if (token) {
      token = token.replace(/^[^a-zA-Z0-9]+/, ''); 
    }

    let bcInstance: BroadcastChannel | null = null;

    if (!token) {
      setVerificationStatus('error');
      setMessage('Overovací odkaz je neplatný alebo chýba token.');
      setShowLoginButton(true); // Allow user to go to login page
      return;
    }

    const verifyEmail = async () => {
      try {
        await axios.get(`${API_BASE_URL}/api/auth/verify-email-by-link?token=${token}`);
        
        setVerificationStatus('success');
        setMessage('Váš e-mail bol úspešne overený! Teraz sa môžete prihlásiť do aplikácie.');

        bcInstance = new BroadcastChannel('email_verification_channel');
        bcInstance.postMessage({ type: 'EMAIL_VERIFIED_SUCCESS' });
        
        setShowLoginButton(true); // Show login button after success
        // Odstránené automatické window.close() alebo navigate()
        // Používateľ bude kliknúť na tlačidlá.

      } catch (err: any) {
        setVerificationStatus('error');
        setMessage(err.response?.data?.message || 'Nepodarilo sa overiť e-mail. Skúste to znova alebo požiadajte o nový odkaz.');
        setShowLoginButton(true); // Show login button after error
        // Odstránené automatické navigate() pri chybe
      }
    };

    verifyEmail();

    return () => {
      if (bcInstance) {
        bcInstance.close();
      }
    };
  }, [location.search]); // navigate odstránené zo závislostí, keďže sa už nepoužíva v useEffect pre auto-redirect

  const handleCloseWindow = () => {
    try {
      if (window.opener) {
        window.close();
      } else {
        setShowManualCloseInstruction(true);
      }
    } catch (e) {
      setShowManualCloseInstruction(true);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">
          {verificationStatus === 'success' ? 'E-mail Overený!' : 'Overenie E-mailu'}
        </h2>
        <p className={`text-lg font-semibold my-4 p-3 rounded-md ${
          verificationStatus === 'loading' ? 'text-blue-500' :
          verificationStatus === 'success' ? 'bg-green-50 text-green-600 border border-green-200' :
          'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {message}
        </p>

        {verificationStatus === 'loading' && (
          <div className="flex justify-center items-center mt-6">
            <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-gray-700">Prosím, počkajte...</span>
          </div>
        )}

        {verificationStatus !== 'loading' && (
          <div className="mt-6 space-y-3">
            {showLoginButton && (
              <Button variant="primary" onClick={handleGoToLogin} className="w-full">
                Prejsť na prihlásenie
              </Button>
            )}
            <Button variant="secondary" onClick={handleCloseWindow} className="w-full">
              Zatvoriť toto okno
            </Button>
            {showManualCloseInstruction && (
              <p className="text-sm text-gray-500 mt-2">
                Toto okno nemôže byť automaticky zatvorené. Prosím, zatvorte ho manuálne.
                Potom sa môžete prihlásiť do aplikácie.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
