// File: front/src/pages/verify-email.page.tsx
// Last change: Replaced Axios with native Fetch API for email verification.

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:10001';

interface VerificationResponse {
  success: boolean;
  message: string;
  user?: any;
  token?: string;
  alreadyVerified?: boolean;
}

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setPendingEmailVerification } = useAuth();
  
  const [status, setStatus] = useState<'processing' | 'success' | 'error' | 'already-verified'>('processing');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link: No token provided.');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify-email-by-link?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Ensure cookies are sent
        });

        const data: VerificationResponse = await response.json().catch(() => ({ success: false, message: 'Invalid response from server.' }));

        if (response.ok && data.success) {
          if (data.alreadyVerified) {
            setStatus('already-verified');
            setMessage('Your email is already verified.');
          } else {
            setStatus('success');
            setMessage('Email successfully verified! You are now logged in.');

            if (data.user) {
              setUser(data.user);
            }

            setPendingEmailVerification(null);
            localStorage.removeItem('pendingEmailVerification');

            // Broadcast success to other tabs
            const bc = new BroadcastChannel('email_verification_channel');
            bc.postMessage({ type: 'EMAIL_VERIFIED_SUCCESS', user: data.user });
            bc.close();
          }
        } else {
          // Handle non-OK responses or unsuccessful verification from the server
          setStatus('error');
          setMessage(data.message || 'Verification failed.');
        }

      } catch (error) {
        // This catch block handles network errors or issues before the response is received
        console.error('[VERIFY_EMAIL_PAGE] Network or unexpected error:', error);
        setMessage('An unexpected error occurred. Please check your internet connection.');
        setStatus('error');
      }
    };

    verifyEmail();
  }, [searchParams, setUser, setPendingEmailVerification]);

  // Countdown timer for redirect
  useEffect(() => {
    if (status === 'success' || status === 'already-verified') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            navigate('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, navigate]);

  const getStatusInfo = () => {
    switch (status) {
      case 'processing':
        return {
          icon: '⏳',
          title: 'Verifying your email...',
          color: '#2196f3',
          showSpinner: true
        };
      case 'success':
        return {
          icon: '✅',
          title: 'Email Verified!',
          color: '#4caf50',
          showSpinner: false
        };
      case 'already-verified':
        return {
          icon: 'ℹ️',
          title: 'Already Verified',
          color: '#ff9800',
          showSpinner: false
        };
      case 'error':
        return {
          icon: '❌',
          title: 'Verification Failed',
          color: '#f44336',
          showSpinner: false
        };
      default:
        return {
          icon: '❓',
          title: 'Unknown Status',
          color: '#757575',
          showSpinner: false
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{
        backgroundColor: 'var(--color-canvas)',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        border: '1px solid var(--color-border)'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          {statusInfo.icon}
        </div>

        <h1 style={{
          color: statusInfo.color,
          marginBottom: '16px',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          {statusInfo.title}
        </h1>

        <p style={{
          color: 'var(--color-text-muted)', /* Changed to use theme variable */
          marginBottom: '24px',
          lineHeight: '1.5',
          fontSize: '16px'
        }}>
          {message}
        </p>

        {statusInfo.showSpinner && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: statusInfo.color,
            marginBottom: '20px'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid rgba(33, 150, 243, 0.3)',
              borderTop: '2px solid #2196f3',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span>Please wait...</span>
          </div>
        )}

        {(status === 'success' || status === 'already-verified') && (
          <div style={{
            backgroundColor: 'var(--color-primary-100)', /* Changed to use theme variable */
            border: '1px solid var(--color-primary-300)', /* Changed to use theme variable */
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <p style={{
              color: 'var(--color-primary-700)', /* Changed to use theme variable */
              margin: '0',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Redirecting to home page in {countdown} seconds...
            </p>
          </div>
        )}

        {status === 'error' && (
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: 'var(--color-primary-500)', /* Changed to use theme variable */
              color: 'var(--color-text)', /* Changed to use theme variable */
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-600)'} /* Changed to use theme variable */
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-500)'} /* Changed to use theme variable */
          >
            Go to Home Page
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VerifyEmailPage;