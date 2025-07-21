// File: front/src/components/shared/elements/MessageBanner.tsx
// Last change: Added inline verification code input functionality

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

interface MessageBannerProps {
  // No direct props needed, as it will consume from AuthContext
}

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:10000';

const MessageBanner: React.FC<MessageBannerProps> = () => {
  const { pendingEmailVerification, setPendingEmailVerification, user } = useAuth();
  const [countdown, setCountdown] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  
  // New states for code verification
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let bcInstance: BroadcastChannel | null = null; 

    if (pendingEmailVerification && !user) {
      setShowBanner(true);
      setBannerType('info');
      setBannerMessage(`Skontrolujte si e-mail (${pendingEmailVerification.email}) pre overovací link alebo zadajte kód nižšie.`);

      setCountdown(Math.max(0, Math.floor((pendingEmailVerification.expiresAt - Date.now()) / 1000)));

      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer as NodeJS.Timeout);
            setPendingEmailVerification(null);
            setBannerMessage('Platnosť overovacieho linku vypršala. Prosím, prihláste sa a požiadajte o nový.');
            setBannerType('error');
            setShowCodeInput(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      bcInstance = new BroadcastChannel('email_verification_channel');
      bcInstance.onmessage = (event) => {
        if (event.data.type === 'EMAIL_VERIFIED_SUCCESS') {
          clearInterval(timer as NodeJS.Timeout);
          setPendingEmailVerification(null);
          setBannerMessage('Váš e-mail bol úspešne overený! Teraz sa môžete prihlásiť.');
          setBannerType('success');
          setCountdown(0);
          setShowCodeInput(false);
        }
      };
    } else {
      setShowBanner(false);
      if (timer) clearInterval(timer);
      if (bcInstance) (bcInstance as BroadcastChannel).close();
      setCountdown(0);
      setShowCodeInput(false);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (bcInstance) (bcInstance as BroadcastChannel).close();
    };
  }, [pendingEmailVerification, setPendingEmailVerification, user]);

  const handleCloseBanner = () => {
    setShowBanner(false);
    setPendingEmailVerification(null);
    setShowCodeInput(false);
  };

  const handleResendEmail = useCallback(async () => {
    if (!pendingEmailVerification?.email) return;

    setResendLoading(true);
    setResendError(null);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/resend-verification`, { 
        email: pendingEmailVerification.email 
      });
      
      const newExpiresAt = Date.now() + (15 * 60 * 1000);
      setPendingEmailVerification({ 
        email: pendingEmailVerification.email, 
        expiresAt: newExpiresAt 
      });
      setBannerMessage(`Nový overovací e-mail bol odoslaný na ${pendingEmailVerification.email}.`);
      setBannerType('info');
      setCountdown(Math.max(0, Math.floor((newExpiresAt - Date.now()) / 1000)));
    } catch (err: any) {
      setResendError(err.response?.data?.message || 'Nepodarilo sa odoslať nový overovací e-mail.');
    } finally {
      setResendLoading(false);
    }
  }, [pendingEmailVerification, setPendingEmailVerification]);

  const handleVerifyCode = useCallback(async () => {
    if (!pendingEmailVerification?.email || !verificationCode.trim()) return;

    setCodeLoading(true);
    setCodeError(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-email-by-code`, {
        email: pendingEmailVerification.email,
        code: verificationCode.trim().toUpperCase()
      });

      if (response.data.success) {
        // Success!
        setPendingEmailVerification(null);
        setBannerMessage('E-mail úspešne overený! Teraz sa môžete prihlásiť.');
        setBannerType('success');
        setShowCodeInput(false);
        setVerificationCode('');
        
        // Broadcast success for other components
        const bc = new BroadcastChannel('email_verification_channel');
        bc.postMessage({ type: 'EMAIL_VERIFIED_SUCCESS' });
        bc.close();
        
        // Auto-hide banner after 3 seconds
        setTimeout(() => {
          setShowBanner(false);
        }, 3000);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Nesprávny alebo vypršaný kód.';
      setCodeError(errorMessage);
      
      if (err.response?.data?.errorCode === 'INVALID_CODE') {
        // Clear invalid code
        setVerificationCode('');
      }
    } finally {
      setCodeLoading(false);
    }
  }, [pendingEmailVerification, verificationCode, setPendingEmailVerification]);

  const handleCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setVerificationCode(value);
    setCodeError(null);
  };

  const handleCodeKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && verificationCode.length === 6) {
      handleVerifyCode();
    }
  };

  const toggleCodeInput = () => {
    setShowCodeInput(!showCodeInput);
    setVerificationCode('');
    setCodeError(null);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const bannerColors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className={`border-l-4 shadow-sm ${bannerColors[bannerType]} transition-all duration-300 ease-in-out`} role="alert">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <div className="mr-3">
                {bannerType === 'success' ? (
                  <div className="w-5 h-5 text-green-600">✅</div>
                ) : bannerType === 'error' ? (
                  <div className="w-5 h-5 text-red-600">❌</div>
                ) : (
                  <div className="w-5 h-5 text-blue-600">📧</div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {bannerType === 'success' ? 'Overenie úspešné!' : 'Potrebné overenie e-mailu'}
                </p>
                <p className="text-sm mt-1">{bannerMessage}</p>
              </div>
            </div>
            
            {/* Countdown */}
            {(bannerType === 'info' || bannerType === 'warning') && countdown > 0 && (
              <p className="text-xs mt-2 font-medium">
                ⏰ Čas do vypršania: {formatTime(countdown)}
              </p>
            )}

            {/* Error messages */}
            {resendError && <p className="text-red-600 text-sm mt-2">❌ {resendError}</p>}
            {codeError && <p className="text-red-600 text-sm mt-2">❌ {codeError}</p>}
          </div>

          <button
            onClick={handleCloseBanner}
            className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
            aria-label="Close message"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Action buttons */}
        {bannerType === 'info' && countdown > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleResendEmail}
              className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={resendLoading}
            >
              {resendLoading ? '📤 Odosielam...' : '📧 Odoslať znova'}
            </button>

            <button
              onClick={toggleCodeInput}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md font-medium transition-colors"
            >
              {showCodeInput ? '❌ Zrušiť kód' : '🔢 Zadať kód'}
            </button>
          </div>
        )}

        {/* Code input section */}
        {showCodeInput && bannerType === 'info' && countdown > 0 && (
          <div className="mt-4 p-3 bg-white/50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-800 mb-2">
              💌 Zadajte 6-miestny kód z e-mailu:
            </p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={verificationCode}
                onChange={handleCodeInputChange}
                onKeyPress={handleCodeKeyPress}
                placeholder="ABC123"
                className="flex-1 px-3 py-2 border border-blue-300 rounded-md text-center font-mono text-lg tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                maxLength={6}
                disabled={codeLoading}
              />
              <button
                onClick={handleVerifyCode}
                disabled={verificationCode.length !== 6 || codeLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors text-sm"
              >
                {codeLoading ? '⏳' : '✅ Overiť'}
              </button>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              💡 Tip: Stlačte Enter po zadaní 6-miestneho kódu
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBanner;