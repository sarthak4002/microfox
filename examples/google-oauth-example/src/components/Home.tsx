import { Link } from 'react-router-dom';
import { useEffect } from 'react';

interface HomeProps {
  tokenState: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    isValid: boolean;
  };
}

const Home = ({ tokenState }: HomeProps) => {
  // Log token state on component mount
  useEffect(() => {
    console.log('Home component - Token state:', {
      hasAccessToken: !!tokenState.accessToken,
      hasRefreshToken: !!tokenState.refreshToken,
      expiresAt: tokenState.expiresAt
        ? new Date(tokenState.expiresAt).toISOString()
        : 'none',
      isValid: tokenState.isValid,
    });
  }, [tokenState]);

  // Format token for display (first 10 chars + last 4 chars)
  const formatToken = (token: string): string => {
    if (!token) return 'Not present';
    if (token.length <= 14) return '********';
    return `${token.substring(0, 10)}...${token.substring(token.length - 4)}`;
  };

  return (
    <div className="card">
      <h2>Welcome to Microfox Google SDKs Demo</h2>
      <p>
        This example demonstrates how to use the Microfox SDK packages to
        interact with Google services through a unified authentication flow.
      </p>

      <div style={{ marginTop: '1.5rem' }}>
        <h3>Microfox SDKs Featured in this Demo</h3>
        <ul
          style={{ textAlign: 'left', listStyle: 'none', marginTop: '0.5rem' }}
        >
          <li>
            📦 <strong>@microfox/google-sdk</strong> - OAuth authentication and
            token management
          </li>
          <li>
            📦 <strong>@microfox/drive-sdk</strong> - Google Drive API
            integration
          </li>
          <li>
            📦 <strong>@microfox/youtube-sdk</strong> - YouTube API integration
          </li>
          <li>
            📦 <strong>@microfox/rest-sdk</strong> - The foundation for all API
            interactions
          </li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Getting Started</h3>
        <ol style={{ textAlign: 'left', marginLeft: '2rem' }}>
          <li>
            First, <Link to="/oauth">authenticate with Google</Link> using
            Microfox's Google SDK
          </li>
          <li>
            Once authenticated, explore the <Link to="/drive">Drive SDK</Link>{' '}
            features for file management
          </li>
          <li>
            Also try the <Link to="/youtube">YouTube SDK</Link> features for
            channel and video management
          </li>
        </ol>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Authentication Status</h3>
        {tokenState.isValid ? (
          <div>
            <p>✅ You are authenticated via Microfox Google SDK</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Token expires at:{' '}
              {new Date(tokenState.expiresAt).toLocaleString()}
            </p>
            <div
              style={{
                fontSize: '0.85rem',
                marginTop: '1rem',
                textAlign: 'left',
                padding: '1rem',
                background: '#f5f5f5',
                borderRadius: '4px',
              }}
            >
              <p>
                <strong>Access Token:</strong>{' '}
                {formatToken(tokenState.accessToken)}
              </p>
              <p>
                <strong>Refresh Token:</strong>{' '}
                {formatToken(tokenState.refreshToken)}
              </p>
              <p>
                <strong>Expiration:</strong>{' '}
                {new Date(tokenState.expiresAt).toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <div>
            <p>❌ You are not authenticated</p>
            <Link to="/oauth">
              <button style={{ marginTop: '0.5rem' }}>Authenticate Now</button>
            </Link>

            {/* Show partial token information for debugging if present but invalid */}
            {tokenState.accessToken && (
              <div
                style={{
                  fontSize: '0.85rem',
                  marginTop: '1rem',
                  textAlign: 'left',
                  padding: '1rem',
                  background: '#fff4f4',
                  borderRadius: '4px',
                  border: '1px solid #ffcdd2',
                }}
              >
                <p>
                  <strong>Debug Info - Invalid Tokens:</strong>
                </p>
                <p>
                  <strong>Access Token:</strong>{' '}
                  {formatToken(tokenState.accessToken)}
                </p>
                <p>
                  <strong>Refresh Token:</strong>{' '}
                  {formatToken(tokenState.refreshToken)}
                </p>
                <p>
                  <strong>Expiration:</strong>{' '}
                  {tokenState.expiresAt
                    ? new Date(tokenState.expiresAt).toLocaleString()
                    : 'Not set'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
