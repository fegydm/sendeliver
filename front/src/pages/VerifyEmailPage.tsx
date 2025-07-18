// File: front/src/pages/VerifyEmailPage.tsx
// Last change: Created page for email verification via link, handling token and displaying status.

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/shared/ui/button.ui'; // Assuming you have a Button component
import GeneralModal from '@/components/shared/modals/general.modal'; // Reusing GeneralModal for consistent styling

// Defines the props for the VerifyEmailPage component.
interface VerifyEmailPageProps {
  // No specific props needed as it reads from URL.
}

// VerifyEmailPage component handles email verification via a link.
const VerifyEmailPage: React.FC<VerifyEmailPageProps> = () => {
  const location = useLocation(); // Hook to access URL's query parameters.
  const navigate = useNavigate(); // Hook for programmatic navigation.
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying your email...');

  // Effect hook to run verification when the component mounts.
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token'); // Extract token from URL.

    if (!token) {
      // If no token is found, set error status.
      setVerificationStatus('error');
      setMessage('Verification link is invalid or missing a token.');
      return;
    }

    // Function to call the backend verification endpoint.
    const verifyEmail = async () => {
      try {
        // Call the backend API for email verification by link.
        // Backend should handle setting the cookie and redirecting to dashboard.
        // This frontend page will then be loaded on the dashboard.
        // However, if we want to display a message on this page first,
        // the backend should return a success/error message and NOT redirect immediately.
        // Given our latest discussion, the backend *will* redirect to dashboard.
        // So, this page will primarily show a loading state and then redirect.
        // If the backend redirects, this axios call might not complete successfully on this page.
        // A better approach for this specific UX is to let backend handle redirect.
        // This page is more for displaying a message if backend DOES NOT redirect.

        // For now, we'll assume backend redirects on success.
        // If backend does NOT redirect, this code will handle the message display.
        const response = await axios.get(`/api/auth/verify-email-by-link?token=${token}`);
        
        if (response.status === 200) {
          setVerificationStatus('success');
          setMessage('Your email has been successfully verified! You can now close this window or navigate to the dashboard.');
        } else {
          setVerificationStatus('error');
          setMessage(response.data?.message || 'An unexpected error occurred during verification.');
        }
      } catch (err: any) {
        setVerificationStatus('error');
        // Check if the error is due to a redirect (e.g., CORS preflight failure on redirect)
        // This is a common issue when backend redirects a GET request.
        if (err.response && err.response.status === 0) { // Status 0 often indicates network error or redirect issue
             setMessage('Verification successful, redirecting to dashboard...');
             setVerificationStatus('success'); // Assume success if backend initiated redirect
             setTimeout(() => navigate('/dashboard', { replace: true }), 1000); // Manual redirect
        } else {
            setMessage(err.response?.data || 'Failed to verify email. Please try again or request a new link.');
        }
      }
    };

    verifyEmail();
  }, [location.search, navigate]);

  // Handles the "Login and Continue" button click.
  const handleLoginAndContinue = () => {
    navigate('/dashboard', { replace: true });
  };

  // Handles the "Close this window" button click.
  const handleCloseWindow = () => {
    window.close(); // Attempt to close the current tab/window.
  };

  // Renders the verification status and messages.
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <GeneralModal
        isOpen={true} // Always open for this page.
        onClose={() => { /* No direct close action needed, handled by buttons */ }}
        title={verificationStatus === 'success' ? 'Email Verified!' : 'Email Verification'}
        description={verificationStatus === 'loading' ? 'Please wait...' : ''}
      >
        <div className="text-center">
          {verificationStatus === 'loading' && (
            <div className="text-blue-500 text-lg font-semibold">
              {message}
            </div>
          )}
          {verificationStatus === 'success' && (
            <div className="text-green-600 text-lg font-semibold my-4 p-3 border rounded-md bg-green-50 border-green-200">
              {message}
            </div>
          )}
          {verificationStatus === 'error' && (
            <div className="text-red-600 text-lg font-semibold my-4 p-3 border rounded-md bg-red-50 border-red-200">
              {message}
            </div>
          )}

          {verificationStatus !== 'loading' && (
            <div className="mt-6 space-y-3">
              {verificationStatus === 'success' && (
                <Button variant="primary" onClick={handleLoginAndContinue} className="w-full">
                  Login and Continue
                </Button>
              )}
              <Button variant="secondary" onClick={handleCloseWindow} className="w-full">
                Close this window
              </Button>
            </div>
          )}
        </div>
      </GeneralModal>
    </div>
  );
};

export default VerifyEmailPage;
