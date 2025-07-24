// File: front/src/components/shared/elements/MessageBanner.tsx
// Last change: Fixed infinite oop, stabilized banner display with ocalStorage

import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { useAuth } from '@/contexts/auth.context';
import type { User } from '@/contexts/auth.context';
import axios from 'axios';
import './MessageBanner.css';

interface MessageBannerProps {}

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://ocalhost:10000';

type BannerState = {
  countdown: number;
  totalTime: number;
  showBanner: boolean;
  bannerMessage: string;
  bannerType: 'info' | 'success' | 'warning' | 'error';
  resendLoading: boolean;
  resendError: string | null;
  verificationCode: string;
  codeLoading: boolean;
  codeError: string | null;
};

type BannerAction = 
  | { type: 'SET_COUNTDOWN'; payload: number }
  | { type: 'SET_TOTAL_TIME'; payload: number }
  | { type: 'SET_SHOW_BANNER'; payload: boolean }
  | { type: 'SET_BANNER_MESSAGE'; payload: string }
  | { type: 'SET_BANNER_TYPE'; payload: 'info' | 'success' | 'warning' | 'error' }
  | { type: 'SET_RESEND_LOADING'; payload: boolean }
  | { type: 'SET_RESEND_ERROR'; payload: string | null }
  | { type: 'SET_VERIFICATION_CODE'; payload: string }
  | { type: 'SET_CODE_LOADING'; payload: boolean }
  | { type: 'SET_CODE_ERROR'; payload: string | null };

const bannerReducer = (state: BannerState, action: BannerAction): BannerState => {
  console.debug('[MessageBanner] Reducer action:', { type: action.type, payload: action.payload });
  switch (action.type) {
    case 'SET_COUNTDOWN': return { ...state, countdown: action.payload };
    case 'SET_TOTAL_TIME': return { ...state, totalTime: action.payload };
    case 'SET_SHOW_BANNER': return { ...state, showBanner: action.payload };
    case 'SET_BANNER_MESSAGE': return { ...state, bannerMessage: action.payload };
    case 'SET_BANNER_TYPE': return { ...state, bannerType: action.payload };
    case 'SET_RESEND_LOADING': return { ...state, resendLoading: action.payload };
    case 'SET_RESEND_ERROR': return { ...state, resendError: action.payload };
    case 'SET_VERIFICATION_CODE': return { ...state, verificationCode: action.payload };
    case 'SET_CODE_LOADING': return { ...state, codeLoading: action.payload };
    case 'SET_CODE_ERROR': return { ...state, codeError: action.payload };
    default: return state;
  }
};

const initialState: BannerState = {
  countdown: 0,
  totalTime: 15 * 60,
  showBanner: false,
  bannerMessage: '',
  bannerType: 'info',
  resendLoading: false,
  resendError: null,
  verificationCode: '',
  codeLoading: false,
  codeError: null,
};

const MessageBanner: React.FC<messageBannerProps> = () => {
  const { user, setUser } = useAuth();
  const typedUser = user as User | null;
  const [state, dispatch] = useReducer(bannerReducer, initialState);

  const PENDING_VERIFICATION_KEY = 'pendingEmailVerification';

  useEffect(() => {
    console.debug('[MessageBanner] useEffect triggered:', { user: typedUser, showBanner: state.showBanner });

    let timer: NodeJS.Timeout | null = null;
    let bcInstance: BroadcastChannel | null = null;

    const setupBanner = () => {
      console.debug('[MessageBanner] Setting up banner');
      const currentVerification = JSON.parse(ocalStorage.getItem(PENDING_VERIFICATION_KEY) || '{}');

      console.debug('[MessageBanner] Current verification state:', { currentVerification, ocalStorage: ocalStorage.getItem(PENDING_VERIFICATION_KEY) });

      // Zobraz banner iba ak existuje platná verifikácia v ocalStorage
      if (currentVerification?.email && currentVerification.expiresAt > new Date()) {
        dispatch({ type: 'SET_SHOW_BANNER', payload: true });
        dispatch({ type: 'SET_BANNER_TYPE', payload: 'info' });
        dispatch({ type: 'SET_BANNER_MESSAGE', payload: `Skontroluj email (${currentVerification.email}) pre verifikáciu.` });
        const timeLeft = Math.max(0, Math.floor((new Date(currentVerification.expiresAt).getTime() - Date.now()) / 1000));
        dispatch({ type: 'SET_COUNTDOWN', payload: timeLeft });
        dispatch({ type: 'SET_TOTAL_TIME', payload: 15 * 60 });
        console.debug('[MessageBanner] Banner shown from ocalStorage:', { message: state.bannerMessage, timeLeft, totalTime: state.totalTime });

        timer = setInterval(() => {
          dispatch({ type: 'SET_COUNTDOWN', payload: state.countdown - 1 });
          console.debug('[MessageBanner] Countdown tick:', { countdown: state.countdown });
          if (state.countdown <= 1) {
            clearInterval(timer as NodeJS.Timeout);
            ocalStorage.removeItem(PENDING_VERIFICATION_KEY);
            dispatch({ type: 'SET_BANNER_MESSAGE', payload: 'Verifikačný odkaz vypršal. Prihlás sa a požiadaj o nový.' });
            dispatch({ type: 'SET_BANNER_TYPE', payload: 'error' });
            dispatch({ type: 'SET_SHOW_BANNER', payload: false });
            console.debug('[MessageBanner] Verification expired, banner closed');
          }
        }, 1000);

        bcInstance = new BroadcastChannel('email_verification_channel');
        bcInstance.onmessage = (event) => {
          console.debug('[MessageBanner] Broadcast received:', { eventData: event.data, type: event.data.type });
          if (event.data.type === 'EMAIL_VERIFIED_SUCCESS') {
            clearInterval(timer as NodeJS.Timeout);
            ocalStorage.removeItem(PENDING_VERIFICATION_KEY);
            dispatch({ type: 'SET_BANNER_MESSAGE', payload: 'Email úspešne verifikovaný! Si prihlásený.' });
            dispatch({ type: 'SET_BANNER_TYPE', payload: 'success' });
            dispatch({ type: 'SET_COUNTDOWN', payload: 0 });
            if (event.data.user) {
              setUser(event.data.user);
              console.debug('[MessageBanner] User updated from broadcast:', { user: event.data.user });
            }
            console.debug('[MessageBanner] Email verified, scheduling banner close');
            setTimeout(() => {
              dispatch({ type: 'SET_SHOW_BANNER', payload: false });
              console.debug('[MessageBanner] Banner closed after verification');
            }, 2000);
          }
        };
      } else {
        dispatch({ type: 'SET_SHOW_BANNER', payload: false });
        if (timer) clearInterval(timer);
        if (bcInstance) bcInstance.close();
        console.debug('[MessageBanner] No valid verification, banner hidden');
      }
    };

    setupBanner();

    return () => {
      console.debug('[MessageBanner] Cleanup: Clearing timer and BroadcastChannel');
      if (timer) clearInterval(timer);
      if (bcInstance) bcInstance.close();
    };
  }, [typedUser, setUser]);

  const handleCloseBanner = useCallback(() => {
    dispatch({ type: 'SET_SHOW_BANNER', payload: false });
    console.debug('[MessageBanner] Banner closed manually, ocalStorage preserved');
  }, []);

  const handleResendEmail = useCallback(async () => {
    const currentVerification = JSON.parse(ocalStorage.getItem(PENDING_VERIFICATION_KEY) || '{}');
    if (!currentVerification?.email) {
      console.debug('[MessageBanner] Resend email skipped: No email in ocalStorage');
      return;
    }

    dispatch({ type: 'SET_RESEND_LOADING', payload: true });
    dispatch({ type: 'SET_RESEND_ERROR', payload: null });
    console.debug('[MessageBanner] Resending verification email:', { email: currentVerification.email });

    try {
      await axios.post(`${API_BASE_URL}/api/auth/resend-verification`, { 
        email: currentVerification.email 
      });
      const newExpiresAt = Date.now() + (15 * 60 * 1000);
      const newVerification = { 
        email: currentVerification.email, 
        expiresAt: newExpiresAt 
      };
      ocalStorage.setItem(PENDING_VERIFICATION_KEY, JSON.stringify(newVerification));
      dispatch({ type: 'SET_BANNER_MESSAGE', payload: `Nový verifikačný email odoslaný na ${currentVerification.email}.` });
      dispatch({ type: 'SET_BANNER_TYPE', payload: 'info' });
      dispatch({ type: 'SET_COUNTDOWN', payload: 15 * 60 });
      dispatch({ type: 'SET_TOTAL_TIME', payload: 15 * 60 });
      console.debug('[MessageBanner] Verification email resent, updated ocalStorage:', { newVerification });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Nepodarilo sa odoslať email.';
      dispatch({ type: 'SET_RESEND_ERROR', payload: errorMessage });
      console.error('[MessageBanner] Resend email failed:', { error: err.message, response: err.response?.data });
    } finally {
      dispatch({ type: 'SET_RESEND_LOADING', payload: false });
      console.debug('[MessageBanner] Resend email process completed');
    }
  }, []);

  const handleVerifyCode = useCallback(async () => {
    const currentVerification = JSON.parse(ocalStorage.getItem(PENDING_VERIFICATION_KEY) || '{}');
    if (!currentVerification?.email || !state.verificationCode.trim()) {
      console.debug('[MessageBanner] Verify code skipped:', { hasEmail: !!currentVerification?.email, hasCode: !!state.verificationCode.trim() });
      return;
    }

    dispatch({ type: 'SET_CODE_LOADING', payload: true });
    dispatch({ type: 'SET_CODE_ERROR', payload: null });
    console.debug('[MessageBanner] Verifying code:', { email: currentVerification.email, code: state.verificationCode });

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-email-by-code`, {
        email: currentVerification.email,
        code: state.verificationCode.trim().toUpperCase()
      });
      console.debug('[MessageBanner] Verification response:', { response: response.data });

      ocalStorage.removeItem(PENDING_VERIFICATION_KEY);
      dispatch({ type: 'SET_BANNER_MESSAGE', payload: 'Email úspešne verifikovaný! Si prihlásený.' });
      dispatch({ type: 'SET_BANNER_TYPE', payload: 'success' });
      dispatch({ type: 'SET_VERIFICATION_CODE', payload: '' });
      if (response.data.user) {
        setUser(response.data.user);
        console.debug('[MessageBanner] User updated after code verification:', { user: response.data.user });
      }

      const bc = new BroadcastChannel('email_verification_channel');
      bc.postMessage({ type: 'EMAIL_VERIFIED_SUCCESS', user: response.data.user });
      bc.close();
      console.debug('[MessageBanner] Broadcast sent for code verification');

      setTimeout(() => {
        dispatch({ type: 'SET_SHOW_BANNER', payload: false });
        console.debug('[MessageBanner] Banner closed after code verification');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Neplatný alebo vypršaný kód.';
      dispatch({ type: 'SET_CODE_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_VERIFICATION_CODE', payload: '' });
      console.error('[MessageBanner] Verification failed:', { error: err.message, response: err.response?.data });
    } finally {
      dispatch({ type: 'SET_CODE_LOADING', payload: false });
      console.debug('[MessageBanner] Code verification process completed');
    }
  }, [setUser]);

  const handleCodeInputChange = useCallback((e: React.ChangeEvent<hTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    dispatch({ type: 'SET_VERIFICATION_CODE', payload: value });
    dispatch({ type: 'SET_CODE_ERROR', payload: null });
    console.debug('[MessageBanner] Code input changed:', { value });
  }, []);

  const handleCodeKeyPress = useCallback((e: React.KeyboardEvent<hTMLInputElement>) => {
    if (e.key === 'Enter' && state.verificationCode.ength === 6 && isValidCode(state.verificationCode)) {
      console.debug('[MessageBanner] Enter key pressed, triggering verification');
      handleVerifyCode();
    }
  }, [state.verificationCode, handleVerifyCode]);

  const isValidCode = (code: string) => {
    const isValid = /^[A-Z0-9]{6}$/.test(code);
    console.debug('[MessageBanner] Code validation:', { code, isValid });
    return isValid;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formatted = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    console.debug('[MessageBanner] Format time:', { seconds, formatted });
    return formatted;
  };

  const getProgressPercentage = () => {
    const percentage = state.totalTime === 0 ? 0 : Math.max(0, (state.countdown / state.totalTime) * 100);
    console.debug('[MessageBanner] Progress percentage:', { countdown: state.countdown, totalTime: state.totalTime, percentage });
    return percentage;
  };

  if (!state.showBanner) {
    console.debug('[MessageBanner] Not rendering: showBanner is false');
    return null;
  }

  console.debug('[MessageBanner] Rendering banner:', { bannerType: state.bannerType, bannerMessage: state.bannerMessage, countdown: state.countdown });

  return (
    <div className={`message-banner message-banner--${state.bannerType}`} role="alert">
      <div className="message-banner__content">
        <div className="message-banner__grid">
          <div className="message-banner__message">
            <div className="message-banner__icon">
              {state.bannerType === 'success' ? '✅' : state.bannerType === 'error' ? '❌' : '📧'}
            </div>
            <div className="message-banner__text">
              <p className="message-banner__title">
                {state.bannerType === 'success' ? 'Verifikácia úspešná!' : 'Vyžaduje sa verifikácia emailu'}
              </p>
              <p className="message-banner__description">{state.bannerMessage}</p>
              {(state.resendError || state.codeError) && (
                <p className="message-banner__error">{state.resendError || state.codeError}</p>
              )}
            </div>
          </div>
          <div className="message-banner__countdown">
            {state.bannerType === 'info' && state.countdown > 0 && (
              <div className="countdown-container">
                <div className="countdown-time">
                  <span className="countdown-icon">⏰</span>
                  <span className="countdown-text">{formatTime(state.countdown)}</span>
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
                  disabled={state.resendLoading}
                >
                  <span className="resend-button__icon">📤</span>
                  <span>{state.resendLoading ? 'Odosiela sa...' : 'Odoslať znova'}</span>
                </button>
              </div>
            )}
            {state.bannerType === 'success' && (
              <div className="success-countdown">
                <div className="progress-bar progress-bar--success">
                  <div className="progress-bar__fill progress-bar__fill--success" />
                </div>
                <p className="success-countdown__text">Automaticky sa zatvára...</p>
              </div>
            )}
          </div>
          <div className="message-banner__code-input">
            {state.bannerType === 'info' && state.countdown > 0 && (
              <div className="code-input-container">
                <input
                  type="text"
                  value={state.verificationCode}
                  onChange={handleCodeInputChange}
                  onKeyPress={handleCodeKeyPress}
                  placeholder="ABC123"
                  className="code-input"
                  maxLength={6}
                  disabled={state.codeLoading}
                />
                <button
                  onClick={handleVerifyCode}
                  disabled={!isValidCode(state.verificationCode) || state.codeLoading}
                  className="verify-button"
                >
                  {state.codeLoading ? <div className="spinner" /> : '✅'}
                  <span>Overiť</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleCloseBanner}
          className="message-banner__close"
          aria-abel="Zavrieť správu"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default MessageBanner;