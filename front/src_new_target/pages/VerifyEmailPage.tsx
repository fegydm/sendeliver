// File: front/src/pages/VerifyEmailPage.tsx
// Last change: Added navbar/footer layout and proper verification logic

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:10000';

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
      
      console.log('[VERIFY_EMAIL_PAGE] =================================');
      console.log('[VERIFY_EMAIL_PAGE] Starting email verification');
      console.log('[VERIFY_EMAIL_PAGE] Token:', token?.substring(0, 12) + '...');

      if (!token) {
        console.log('[VERIFY_EMAIL_PAGE] ❌ No token found');
        setStatus('error');
        setMessage('Invalid verification link: No token provided.');
        return;
      }

      try {
        console.log('[VERIFY_EMAIL_PAGE] 📡 Calling verification API...');
        
        const response = await axios.get(`${API_BASE_URL}/api/auth/verify-email-by-link`, {
          params: { token },
          withCredentials: true
        });

        console.log('[VERIFY_EMAIL_PAGE] ✅ API Response:', response.data);

        const data: VerificationResponse = response.data;

        if (data.success) {
          if (data.alreadyVerified) {
            setStatus('already-verified');
            setMessage('Your email is already verified.');
          } else {
            setStatus('success');
            setMessage('Email successfully verified! You are now logged in.');

            if (data.user) {
              console.log('[VERIFY_EMAIL_PAGE] 👤 Setting user:', data.user);
              setUser(data.user);
            }

            setPendingEmailVerification(null);
            localStorage.removeItem('pendingEmailVerification');

            // Broadcast success
            const bc = new BroadcastChannel('email_verification_channel');
            bc.postMessage({ type: 'EMAIL_VERIFIED_SUCCESS', user: data.user });
            bc.close();
          }
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed.');
        }

      } catch (error) {
        console.error('[VERIFY_EMAIL_PAGE] 💥 API Error:', error);
        
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.message || 'Failed to verify email.';
          setMessage(errorMessage);
        } else {
          setMessage('An unexpected error occurred.');
        }
        
        setStatus('error');
      }
      
      console.log('[VERIFY_EMAIL_PAGE] =================================');
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
          color: 'var(--color-text-secondary)',
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
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <p style={{
              color: '#4caf50',
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
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2196f3'}
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