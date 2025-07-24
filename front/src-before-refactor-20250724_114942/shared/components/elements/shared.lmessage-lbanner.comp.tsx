// File: src/shared/components/elements/shared.lmessage-lbanner.comp.tsx
// Last change: Fixed TypeScript error - use emailVerified instead of isEmailVerified

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@shared/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import type { User } from '@shared/contexts/AuthContext';
import axios from 'axios';
import './shared.lmessage-lbanner.css';

interface MessageBannerProps {}

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:10000';

const MessageBanner: React.FC<MessageBannerProps> = () => {
  const { pendingEmailVerification, setPendingEmailVerification, user, setUser } = useAuth();
  const location = useLocation();
  const typedUser = user as User | null;
  
  const [countdown, setCountdown] = useState(0);
  const [totalTime, setTotalTime] = useState(15 * 60);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const isInitialSetup = useRef(true);

  const PENDING_VERIFICATION_KEY = 'pendingEmailVerification';


// ADD this effect RIGHT AFTER:
  // 🎯 RESET INITIAL SETUP WHEN PENDING VERIFICATION CHANGES
  useEffect(() => {
    if (pendingEmailVerification && !showBanner) {
      console.log('[MESSAGE_BANNER] Pending verification changed, resetting initial setup');
      isInitialSetup.current = true;
    }
  }, [pendingEmailVerification, showBanner]);

// THEN find the main useEffect and add this at the very beginning:
  const shouldShowBannerOnThisPage = () => {
    const allowedPaths = ['/', '/dashboard', '/home'];
    return allowedPaths.includes(location.pathname);
  };

  useEffect(() => {
    // 🎯 FORCE RE-INITIALIZATION IF PENDING VERIFICATION EXISTS BUT BANNER NOT SHOWN
    if (pendingEmailVerification && !showBanner && !isInitialSetup.current) {
      console.log('[MESSAGE_BANNER] Force re-initialization due to pending verification');
      isInitialSetup.current = true;
    }
  }, [pendingEmailVerification, showBanner]);

  useEffect(() => {
    if (!isInitialSetup.current) return;

    let timer: NodeJS.Timeout | null = null;
    let bcInstance: BroadcastChannel | null = null;

    let shouldShow = false;

    console.log('[MESSAGE_BANNER] =================================');
    console.log('[MESSAGE_BANNER] Initializing banner');
    console.log('[MESSAGE_BANNER] Current location:', location.pathname);
    console.log('[MESSAGE_BANNER] Should show on this page:', shouldShowBannerOnThisPage());

    // 🎯 DON'T SHOW BANNER ON VERIFICATION PAGES
    if (!shouldShowBannerOnThisPage()) {
      console.log('[MESSAGE_BANNER] Banner disabled for this page');
      setShowBanner(false);
      isInitialSetup.current = false;
      return;
    }

   if (typedUser) {
      // User is logged in - check if email needs verification
      if (typedUser.email && !typedUser.emailVerified) {
        console.log('[MESSAGE_BANNER] User needs email verification:', {
          email: typedUser.email,
          emailVerified: typedUser.emailVerified
        });
        const verification = {
          email: typedUser.email,
          expiresAt: Date.now() + (15 * 60 * 1000)
        };
        setPendingEmailVerification(verification);
        localStorage.setItem(PENDING_VERIFICATION_KEY, JSON.stringify(verification));
        shouldShow = true;
      } else {
        console.log('[MESSAGE_BANNER] User email already verified:', {
          email: typedUser.email,
          emailVerified: typedUser.emailVerified
        });
        setPendingEmailVerification(null);
        localStorage.removeItem(PENDING_VERIFICATION_KEY);
      }
    } else {
      // 🎯 FIXED: Check pendingEmailVerification from AuthContext FIRST
      if (pendingEmailVerification && pendingEmailVerification.email) {
        console.log('[MESSAGE_BANNER] Found pending verification from AuthContext:', pendingEmailVerification);
        shouldShow = true;
      } else {
        // Fallback to localStorage
        const storedVerification = localStorage.getItem(PENDING_VERIFICATION_KEY);
        if (storedVerification) {
          try {
            const parsed = JSON.parse(storedVerification);
            if (parsed.email && parsed.expiresAt > Date.now()) {
              console.log('[MESSAGE_BANNER] Found valid stored verification:', parsed);
              setPendingEmailVerification(parsed);
              shouldShow = true;
            } else {
              console.log('[MESSAGE_BANNER] Stored verification expired');
              localStorage.removeItem(PENDING_VERIFICATION_KEY);
            }
          } catch (error) {
            console.log('[MESSAGE_BANNER] Error parsing stored verification:', error);
            localStorage.removeItem(PENDING_VERIFICATION_KEY);
          }
        }
      }
    }

    if (shouldShow) {
      const currentVerification = pendingEmailVerification || JSON.parse(localStorage.getItem(PENDING_VERIFICATION_KEY) || '{}');
      
      console.log('[MESSAGE_BANNER] Showing verification banner for:', currentVerification.email);
      setShowBanner(true);
      setBannerType('info');
      setBannerMessage(`Check your email (${currentVerification.email}) for verification.`);

      const timeLeft = Math.max(0, Math.floor((currentVerification.expiresAt - Date.now()) / 1000));
      setCountdown(timeLeft);
      setTotalTime(15 * 60);

      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer as NodeJS.Timeout);
            setPendingEmailVerification(null);
            localStorage.removeItem(PENDING_VERIFICATION_KEY);
            setBannerMessage('Verification link has expired. Please log in and request a new one.');
            setBannerType('error');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      bcInstance = new BroadcastChannel('email_verification_channel');
      bcInstance.onmessage = (event) => {
        if (event.data.type === 'EMAIL_VERIFIED_SUCCESS') {
          console.log('[MESSAGE_BANNER] Received verification success broadcast');
          clearInterval(timer as NodeJS.Timeout);
          setPendingEmailVerification(null);
          localStorage.removeItem(PENDING_VERIFICATION_KEY);
          setBannerMessage('Email successfully verified! You are now logged in.');
          setBannerType('success');
          setCountdown(0);
          if (event.data.user) {
            setUser(event.data.user);
          }
          setTimeout(() => setShowBanner(false), 2000);
        }
      };
    } else {
      console.log('[MESSAGE_BANNER] No verification needed');
      setShowBanner(false);
      if (timer) clearInterval(timer);
      if (bcInstance) (bcInstance as BroadcastChannel).close();
      setCountdown(0);
    }

    isInitialSetup.current = false;
    console.log('[MESSAGE_BANNER] =================================');

    return () => {
      if (timer) clearInterval(timer);
      if (bcInstance) (bcInstance as BroadcastChannel).close();
    };
  }, [pendingEmailVerification, setPendingEmailVerification, typedUser, setUser, location.pathname]);

  const handleCloseBanner = () => {
    setShowBanner(false);
  };

  const handleResendEmail = useCallback(async () => {
    if (!pendingEmailVerification?.email) return;

    setResendLoading(true);
    setResendError(null);
    try {
      console.log('[MESSAGE_BANNER] Resending verification email to:', pendingEmailVerification.email);
      await axios.post(`${API_BASE_URL}/api/auth/resend-verification`, { 
        email: pendingEmailVerification.email 
      });
      
      const newExpiresAt = Date.now() + (15 * 60 * 1000);
      const newVerification = { 
        email: pendingEmailVerification.email, 
        expiresAt: newExpiresAt 
      };
      
      setPendingEmailVerification(newVerification);
      localStorage.setItem(PENDING_VERIFICATION_KEY, JSON.stringify(newVerification));
      
      setBannerMessage(`New verification email sent to ${pendingEmailVerification.email}.`);
      setBannerType('info');
      setCountdown(15 * 60);
      setTotalTime(15 * 60);
      console.log('[MESSAGE_BANNER] Verification email resent successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to send new verification email.';
      console.error('[MESSAGE_BANNER] Resend email error:', errorMessage);
      setResendError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  }, [pendingEmailVerification, setPendingEmailVerification]);

  const handleVerifyCode = useCallback(async () => {
    if (!pendingEmailVerification?.email || !verificationCode.trim()) return;

    setCodeLoading(true);
    setCodeError(null);
    
    try {
      console.log('[MESSAGE_BANNER] Verifying code:', {
        email: pendingEmailVerification.email,
        code: verificationCode.trim()
      });
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-email-by-code`, {
        email: pendingEmailVerification.email,
        code: verificationCode.trim().toUpperCase()
      });

      console.log('[MESSAGE_BANNER] Code verification successful:', response.data);

      setPendingEmailVerification(null);
      localStorage.removeItem(PENDING_VERIFICATION_KEY);
      
      setBannerMessage('Email successfully verified! You are now logged in.');
      setBannerType('success');
      setVerificationCode('');
      
      if (response.data.user) {
        console.log('[MESSAGE_BANNER] Setting user from verification response:', response.data.user);
        setUser(response.data.user);
      }
      
      const bc = new BroadcastChannel('email_verification_channel');
      bc.postMessage({ type: 'EMAIL_VERIFIED_SUCCESS', user: response.data.user });
      bc.close();
      
      setTimeout(() => setShowBanner(false), 4000);
      
    } catch (err: any) {
      const errorData = err.response?.data;
      const errorMessage = errorData?.message || 'Invalid or expired code.';
      console.error('[MESSAGE_BANNER] Code verification error:', errorMessage);
      setCodeError(errorMessage);
      setVerificationCode('');
    } finally {
      setCodeLoading(false);
    }
  }, [pendingEmailVerification, verificationCode, setPendingEmailVerification, setUser]);

  const handleCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setVerificationCode(value);
    setCodeError(null);
  };

  const handleCodeKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && verificationCode.length === 6 && isValidCode(verificationCode)) {
      handleVerifyCode();
    }
  };

  const isValidCode = (code: string) => /^[A-Z0-9]{6}$/.test(code);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => (totalTime === 0 ? 0 : Math.max(0, (countdown / totalTime) * 100));

  // 🎯 DOUBLE CHECK - DON'T SHOW BANNER ON WRONG PAGES
  if (!showBanner || !shouldShowBannerOnThisPage()) {
    return null;
  }

  return (
    <div className={`message-banner message-banner--${bannerType}`} role="alert">
      <div className="message-banner__content">
        <div className="message-banner__grid">
          <div className="message-banner__message">
            <div className="message-banner__icon">
              {bannerType === 'success' ? '✅' : bannerType === 'error' ? '❌' : '📧'}
            </div>
            <div className="message-banner__text">
              <p className="message-banner__title">
                {bannerType === 'success' ? 'Verification Successful!' : 'Email Verification Required'}
              </p>
              <p className="message-banner__description">
                {bannerMessage}
              </p>
              {(resendError || codeError) && (
                <p className="message-banner__error">
                  {resendError || codeError}
                </p>
              )}
            </div>
          </div>
          <div className="message-banner__countdown">
            {bannerType === 'info' && countdown > 0 && (
              <div className="countdown-container">
                <div className="countdown-time">
                  <span className="countdown-icon">⏰</span>
                  <span className="countdown-text">
                    {formatTime(countdown)}
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-bar__fill"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
                <button
                  onClick={handleResendEmail}
                  className="resend-button"
                  disabled={resendLoading}
                >
                  <span className="resend-button__icon">📤</span>
                  <span>{resendLoading ? 'Sending...' : 'Resend'}</span>
                </button>
              </div>
            )}
            {bannerType === 'success' && (
              <div className="success-countdown">
                <div className="progress-bar progress-bar--success">
                  <div className="progress-bar__fill progress-bar__fill--success" />
                </div>
                <p className="success-countdown__text">Auto-closing...</p>
              </div>
            )}
          </div>
          <div className="message-banner__code-input">
            {bannerType === 'info' && countdown > 0 && (
              <div className="code-input-container">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={handleCodeInputChange}
                  onKeyPress={handleCodeKeyPress}
                  placeholder="ABC123"
                  className="code-input"
                  maxLength={6}
                  disabled={codeLoading}
                />
                <button
                  onClick={handleVerifyCode}
                  disabled={!isValidCode(verificationCode) || codeLoading}
                  className="verify-button"
                >
                  {codeLoading ? (
                    <div className="spinner" />
                  ) : (
                    '✅'
                  )}
                  <span>Verify</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleCloseBanner}
          className="message-banner__close"
          aria-label="Close message"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default MessageBanner;