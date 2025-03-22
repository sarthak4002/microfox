import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { googleOAuth } from '@microfox/google-sdk';

interface CallbackProps {
  updateTokens: (tokens: {
    accessToken: string;
    refreshToken?: string;
    isValid?: boolean;
    expiresAt?: number;
  }) => void;
}

const Callback = ({ updateTokens }: CallbackProps) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract the authorization code from the URL
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        // Check if state matches what we stored (CSRF protection)
        const storedState = localStorage.getItem('oauthState');
        if (!storedState || state !== storedState) {
          throw new Error('Invalid state parameter. Possible CSRF attack.');
        }

        // Clear the stored state as it's no longer needed
        localStorage.removeItem('oauthState');

        // Get the OAuth credentials from localStorage
        const clientId = localStorage.getItem('clientId');
        const clientSecret = localStorage.getItem('clientSecret');
        const redirectUri = localStorage.getItem('redirectUri');

        if (!code) {
          throw new Error('Authorization code not found in URL');
        }

        if (!clientId || !clientSecret || !redirectUri) {
          throw new Error('OAuth credentials not found');
        }

        // Exchange the authorization code for tokens
        const tokenResponse = await googleOAuth.exchangeCodeForTokens({
          code,
          clientId,
          clientSecret,
          redirectUri,
        });

        // Calculate token expiration time (current time + expires_in seconds)
        const expiresAt = Date.now() + tokenResponse.expires_in * 1000;

        // Update the tokens in the parent component
        updateTokens({
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          expiresAt: expiresAt,
          isValid: true,
        });

        setStatus('success');

        // Redirect to home page after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (err: any) {
        console.error('Error in OAuth callback:', err);
        setError(err.message || 'Unknown error occurred during authentication');
        setStatus('error');
      }
    };

    handleCallback();
  }, [location, navigate, updateTokens]);

  const handleRetry = () => {
    navigate('/oauth');
  };

  if (status === 'error') {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto text-center">
        <div className="text-red-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Authentication Failed
        </h2>
        <p className="text-gray-600 mb-6">
          {error || 'An unknown error occurred during authentication.'}
        </p>
        <button
          onClick={handleRetry}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto text-center">
      <div className="text-green-500 mb-4">
        {status === 'loading' ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {status === 'loading' ? 'Processing...' : 'Authentication Successful!'}
      </h2>
      <p className="text-gray-600">
        {status === 'loading'
          ? 'Exchanging authorization code for tokens...'
          : 'You have successfully authenticated with Google. Redirecting to the home page...'}
      </p>
    </div>
  );
};

export default Callback;
