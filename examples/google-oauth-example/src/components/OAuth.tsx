import { useState } from 'react';

interface OAuthProps {
  tokenRef: React.MutableRefObject<any>;
}

const OAuth = () => {
  const [clientId, setClientId] = useState<string>(
    localStorage.getItem('clientId') || '',
  );
  const [clientSecret, setClientSecret] = useState<string>(
    localStorage.getItem('clientSecret') || '',
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) {
      setError('Please provide a Client ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Store credentials in localStorage for use in the callback
      localStorage.setItem('clientId', clientId);
      localStorage.setItem('clientSecret', clientSecret);

      // Set up redirect URI - use the current origin with the /callback path
      const redirectUri = `${window.location.origin}/callback`;
      localStorage.setItem('redirectUri', redirectUri);

      // Generate a random state value for CSRF protection
      const state =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      localStorage.setItem('oauthState', state);

      // Define the scopes needed for both Drive and YouTube access
      const scopes = [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.force-ssl',
        'https://www.googleapis.com/auth/youtube.upload',
      ];

      // Generate the OAuth URL
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', clientId);
      authUrl.searchParams.append('redirect_uri', redirectUri);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', scopes.join(' '));
      authUrl.searchParams.append('access_type', 'offline');
      authUrl.searchParams.append('prompt', 'consent');
      authUrl.searchParams.append('state', state);

      // Redirect to Google's OAuth page
      window.location.href = authUrl.toString();
    } catch (err: any) {
      console.error('OAuth initialization error:', err);
      setError(err.message || 'Failed to initialize OAuth flow');
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Authentication with Google</h2>
      <p>
        To use this example, you need to provide your Google OAuth credentials.
      </p>

      {error && (
        <div
          style={{
            color: 'red',
            marginTop: '1rem',
            padding: '10px',
            background: '#ffeeee',
            borderRadius: '4px',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Client ID
          </label>
          <input
            type="text"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            placeholder="Your Google OAuth Client ID"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Client Secret
          </label>
          <input
            type="password"
            value={clientSecret}
            onChange={e => setClientSecret(e.target.value)}
            placeholder="Your Google OAuth Client Secret"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
            required
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: '#4285F4',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Authenticating...' : 'Sign in with Google'}
          </button>
        </div>
      </form>

      <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
        <h3>Required Google API Scopes</h3>
        <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem' }}>
          <li>https://www.googleapis.com/auth/drive</li>
          <li>https://www.googleapis.com/auth/drive.file</li>
          <li>https://www.googleapis.com/auth/drive.readonly</li>
          <li>https://www.googleapis.com/auth/youtube</li>
          <li>https://www.googleapis.com/auth/youtube.force-ssl</li>
          <li>https://www.googleapis.com/auth/youtube.upload</li>
        </ul>
        <p style={{ marginTop: '1rem' }}>
          Make sure these scopes are enabled in your Google Cloud Console
          project.
        </p>
      </div>
    </div>
  );
};

export default OAuth;
