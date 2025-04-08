# Google OAuth SDK

A robust TypeScript SDK for Google OAuth 2.0 authentication and API integration. This SDK provides a simple way to integrate Google OAuth 2.0 authentication into your application with built-in security features and TypeScript support.

## Installation

```bash
npm install @microfox/google-oauth-sdk
```

## Features

- 🔒 Built-in CSRF protection with state parameter
- ✨ TypeScript support with full type definitions
- 🛡️ Input validation using Zod schemas
- 🔄 Refresh token support
- 🎯 Comprehensive Google API scopes

## Usage

1. Import the SDK and necessary types:

```typescript
import { GoogleOAuthSdk, GoogleScope } from '@microfox/google-oauth-sdk';
```

2. Initialize the SDK with your Google OAuth credentials:

```typescript
const googleOAuthSdk = new GoogleOAuthSdk({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  redirectUri: 'YOUR_REDIRECT_URI',
  scopes: [GoogleScope.OPENID, GoogleScope.PROFILE, GoogleScope.EMAIL], // Optional, these are the default scopes
  state: 'custom-state-string', // Optional, a random state will be generated if not provided
});
```

3. Generate the authorization URL:

```typescript
// The SDK automatically configures offline access and consent prompt
const authUrl = googleOAuthSdk.getAuthUrl();
// This will include access_type=offline and prompt=consent by default
```

4. Handle the OAuth callback:

```typescript
// Get the state from the redirect URL and verify it
const receivedState = new URL(redirectUrl).searchParams.get('state');
const expectedState = await googleOAuthSdk.getState();

if (receivedState === expectedState) {
  const code = new URL(redirectUrl).searchParams.get('code');
  if (code) {
    try {
      const { accessToken, refreshToken, idToken, expiresIn } =
        await googleOAuthSdk.exchangeCodeForTokens(code);
      // Store tokens securely and use them for API calls
    } catch (error) {
      // Handle token exchange error
      console.error('Token exchange failed:', error);
    }
  }
} else {
  // Handle invalid state (potential CSRF attack)
  console.error('Invalid state parameter');
}
```

5. Refresh expired access tokens:

```typescript
try {
  const { accessToken, expiresIn } =
    await googleOAuthSdk.refreshAccessToken(refreshToken);
  // Update stored access token
} catch (error) {
  // Handle refresh token error
  console.error('Token refresh failed:', error);
}
```

## Available Scopes

The SDK provides a comprehensive set of Google API scopes through the `GoogleScope` enum:

### Default Scopes

- `GoogleScope.OPENID` - OpenID Connect scope
- `GoogleScope.PROFILE` - User's basic profile information
- `GoogleScope.EMAIL` - User's email address

### Additional Available Scopes

- `GoogleScope.CALENDAR` - Access to Google Calendar
- `GoogleScope.DRIVE` - Access to Google Drive
- `GoogleScope.GMAIL` - Read-only access to Gmail
- `GoogleScope.CONTACTS` - Read-only access to Contacts
- `GoogleScope.YOUTUBE` - Access to YouTube
- `GoogleScope.PHOTOS` - Read-only access to Google Photos
- `GoogleScope.FITNESS` - Read-only access to Fitness activity data
- `GoogleScope.TASKS` - Access to Tasks
- `GoogleScope.SHEETS` - Read-only access to Google Sheets
- `GoogleScope.DOCS` - Read-only access to Google Docs

## Error Handling

The SDK uses Zod for input validation and provides clear error messages:

```typescript
try {
  const { accessToken, refreshToken, idToken, expiresIn } =
    await googleOAuthSdk.exchangeCodeForTokens(code);
} catch (error) {
  if (error instanceof Error) {
    console.error('OAuth error:', error.message);
    // Error messages will be in format: "error_code: error_description"
  }
}
```

## Security Best Practices

This SDK implements several security features:

- CSRF protection using state parameter (auto-generated if not provided)
- Input validation using Zod schemas
- Automatic offline access configuration for refresh tokens
- Forced consent prompt to ensure user awareness
- Type-safe token handling

Best practices for implementation:

- Store client credentials securely (use environment variables)
- Keep access and refresh tokens secure
- Use HTTPS for all OAuth endpoints
- Always verify the state parameter on callbacks
- Implement proper session management
- Never expose tokens in client-side code or URLs

## Requirements

- Node.js >= 20.0.0
- TypeScript >= 5.0 (for TypeScript users)

## License

This SDK is released under the MIT License.
