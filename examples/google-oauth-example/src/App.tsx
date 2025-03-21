import { Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { googleOAuth } from '@microfox/google-sdk';
import OAuth from './components/OAuth';
import Callback from './components/Callback';
import Drive from './components/Drive';
import YouTube from './components/YouTube';
import './index.css';

// Define token interface
interface TokenState {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  isValid: boolean;
}

function App() {
  // Initialize tokens from localStorage if available
  const [tokens, setTokens] = useState<TokenState>(() => {
    const savedTokens = localStorage.getItem('google_tokens');
    if (savedTokens) {
      try {
        const parsedTokens = JSON.parse(savedTokens);
        console.log('Loaded tokens from localStorage:', {
          hasAccessToken: !!parsedTokens.accessToken,
          hasRefreshToken: !!parsedTokens.refreshToken,
          expiresAt: parsedTokens.expiresAt,
          isValid: parsedTokens.isValid,
        });

        // Check if the token is expired
        const currentTime = Date.now();
        // Convert expiresAt to milliseconds if it's in seconds (less than year 2000 timestamp)
        const expiresAtMs =
          parsedTokens.expiresAt > 9999999999
            ? parsedTokens.expiresAt // Already in milliseconds
            : parsedTokens.expiresAt * 1000; // Convert seconds to milliseconds

        console.log('Token expiration check:', {
          currentTime,
          expiresAtMs,
          isExpired: expiresAtMs < currentTime,
        });

        if (expiresAtMs && expiresAtMs < currentTime) {
          // Token is expired, but we still have the refresh token
          if (parsedTokens.refreshToken) {
            console.log('Token is expired but refresh token is available');
            return {
              ...parsedTokens,
              expiresAt: expiresAtMs, // Ensure expiresAt is in milliseconds
              isValid: false, // Mark as invalid to trigger refresh
            };
          }
          console.log('Token is expired and no refresh token available');
          return { isValid: false }; // No refresh token, need to re-authenticate
        }

        // Token is valid
        return {
          ...parsedTokens,
          expiresAt: expiresAtMs, // Ensure expiresAt is in milliseconds
          isValid: true,
        };
      } catch (e) {
        console.error('Error parsing tokens from localStorage:', e);
        return { isValid: false };
      }
    }
    console.log('No tokens found in localStorage');
    return { isValid: false };
  });

  // Update tokens with new values
  const updateTokens = useCallback((newTokens: Partial<TokenState>) => {
    console.log('Updating tokens:', newTokens);
    setTokens(current => {
      const updatedTokens = { ...current, ...newTokens };
      // Save to localStorage immediately
      localStorage.setItem('google_tokens', JSON.stringify(updatedTokens));
      return updatedTokens;
    });
  }, []);

  // Refresh token function using the SDK
  const refreshToken = useCallback(async () => {
    console.log('Refreshing token with the SDK...');

    if (!tokens.refreshToken) {
      console.log('No refresh token available');
      return false;
    }

    try {
      // Get client credentials from localStorage
      const clientId = localStorage.getItem('clientId');
      const clientSecret = localStorage.getItem('clientSecret');

      if (!clientId || !clientSecret) {
        console.error('Client credentials not found for token refresh');
        return false;
      }

      // Use the SDK to refresh the token
      const refreshResult = await googleOAuth.refreshAccessToken(
        tokens.refreshToken,
        clientId,
        clientSecret,
      );

      if (!refreshResult || !refreshResult.isValid) {
        console.error(
          'Token refresh failed:',
          refreshResult?.errorMessage || 'No result from SDK',
        );
        updateTokens({ isValid: false });
        return false;
      }

      console.log('Token refreshed successfully via SDK:', {
        hasAccessToken: !!refreshResult.accessToken,
        expiresAt: refreshResult.expiresAt,
      });

      // Update tokens
      updateTokens(refreshResult);

      return true;
    } catch (err) {
      console.error('Error during token refresh:', err);
      updateTokens({ isValid: false });
      return false;
    }
  }, [tokens.refreshToken, updateTokens]);

  // Handle token refresh when the app loads and tokens are invalid but have refresh token
  useEffect(() => {
    const handleInitialRefresh = async () => {
      // Always check if a refresh is needed on app load if we have a refresh token
      if (tokens.refreshToken) {
        const currentTime = Date.now();
        const expiresAtMs = tokens.expiresAt || 0;

        console.log('Checking if token refresh is needed:', {
          currentTime,
          expiresAtMs,
          isExpired: expiresAtMs < currentTime,
          hasRefreshToken: !!tokens.refreshToken,
        });

        // Refresh if token is invalid or expires in less than 5 minutes
        if (
          !tokens.isValid ||
          expiresAtMs < currentTime ||
          expiresAtMs - currentTime < 300000
        ) {
          console.log('Token needs refresh. Attempting refresh...');
          await refreshToken();
        } else {
          console.log('Token is still valid. No refresh needed.');
        }
      }
    };

    handleInitialRefresh();
  }, [tokens.refreshToken, tokens.expiresAt, tokens.isValid, refreshToken]);

  // Handle logout
  const handleLogout = useCallback(() => {
    console.log('Logging out. Clearing all credentials and tokens.');
    // Clear tokens and credentials
    localStorage.removeItem('google_tokens');
    localStorage.removeItem('clientId');
    localStorage.removeItem('clientSecret');
    localStorage.removeItem('redirectUri');
    localStorage.removeItem('oauthState');

    // Reset tokens state
    setTokens({ isValid: false });
  }, []);

  return (
    <div className="app-container">
      <nav className="app-navigation">
        <h1>Google OAuth Example</h1>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/drive">Drive</Link>
          <Link to="/youtube">YouTube</Link>
          {tokens.isValid ? (
            <button onClick={handleLogout} className="logout-button">
              Log Out
            </button>
          ) : (
            <Link to="/oauth">Sign In</Link>
          )}
        </div>
      </nav>

      <div className="app-content">
        <Routes>
          <Route
            path="/"
            element={
              <div className="card">
                <h2>Microfox Google SDKs Example</h2>
                <p>
                  This is an example application showcasing the usage of
                  Microfox's Google SDKs for Drive and YouTube.
                </p>

                {tokens.isValid ? (
                  <div>
                    <p style={{ color: 'green', marginTop: '1rem' }}>
                      ✓ You are authenticated with Google
                    </p>
                    <div style={{ marginTop: '1rem' }}>
                      <p>Navigate to:</p>
                      <div
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          marginTop: '0.5rem',
                        }}
                      >
                        <Link to="/drive">
                          <button>Drive SDK Example</button>
                        </Link>
                        <Link to="/youtube">
                          <button>YouTube SDK Example</button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ color: 'orange', marginTop: '1rem' }}>
                      ⚠ You need to authenticate with Google to use the SDKs
                    </p>
                    <Link to="/oauth">
                      <button style={{ marginTop: '1rem' }}>
                        Sign in with Google
                      </button>
                    </Link>
                  </div>
                )}

                <div style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
                  <h3>About this example</h3>
                  <p>This example demonstrates:</p>
                  <ul
                    style={{
                      listStyleType: 'disc',
                      paddingLeft: '1.5rem',
                      marginTop: '0.5rem',
                    }}
                  >
                    <li>Google OAuth authentication flow</li>
                    <li>Using the Drive SDK to interact with Google Drive</li>
                    <li>Using the YouTube SDK to interact with YouTube</li>
                    <li>Managing and refreshing OAuth tokens</li>
                  </ul>
                </div>
              </div>
            }
          />
          <Route path="/oauth" element={<OAuth />} />
          <Route
            path="/callback"
            element={<Callback updateTokens={updateTokens} />}
          />
          <Route
            path="/drive"
            element={<Drive tokens={tokens} updateTokens={updateTokens} />}
          />
          <Route
            path="/youtube"
            element={<YouTube tokens={tokens} updateTokens={updateTokens} />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
