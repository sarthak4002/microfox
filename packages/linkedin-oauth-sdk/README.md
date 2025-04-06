# @microfox/linkedin-oauth-sdk

A robust TypeScript SDK for LinkedIn OAuth 2.0 authentication.

## Features

- 📘 Full TypeScript support with type definitions
- 🔐 OAuth 2.0 authentication flow
- 🔑 Support for all LinkedIn OAuth scopes:
  - `openid`: Use OpenID Connect to verify user identity
  - `profile`: Access to basic profile information
  - `w_member_social`: Create, modify, and delete posts, comments, and reactions
  - `email`: Access to primary email address
  - `offline_access`: Enable refresh tokens for long-term access
- 🛡️ Built-in CSRF protection with state parameter
- 📱 Share functionality for posting content
- ⚠️ Error handling with descriptive messages
- 🔍 Zod schema validation for responses

## Installation

```bash
npm install @microfox/linkedin-oauth-sdk
# or
yarn add @microfox/linkedin-oauth-sdk
# or
pnpm add @microfox/linkedin-oauth-sdk
```

## Usage

### Basic Setup

```typescript
import { LinkedInOAuthSdk, LinkedInScope } from '@microfox/linkedin-oauth-sdk';

const sdk = new LinkedInOAuthSdk({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  redirectUri: 'https://your-app.com/callback',
  scopes: [LinkedInScope.OPENID, LinkedInScope.PROFILE],
});
```

### OAuth Flow

1. Generate authorization URL:

```typescript
const authUrl = sdk.getAuthUrl();
// Redirect user to authUrl
```

2. Handle callback and get access token:

```typescript
const code = 'authorization_code_from_callback';
const { accessToken, refreshToken } = await sdk.exchangeCodeForTokens(code);
// Note: refreshToken will be null if OFFLINE_ACCESS scope was not requested
```

3. Get user profile:

```typescript
const profile = await sdk.getProfile(accessToken);
console.log(profile.localizedFirstName, profile.localizedLastName);
```

4. Get user email:

```typescript
const email = await sdk.getEmailAddress(accessToken);
console.log(email);
```

### Refresh Tokens

To enable refresh tokens, include the `OFFLINE_ACCESS` scope when initializing the SDK:

```typescript
const sdk = new LinkedInOAuthSdk({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  redirectUri: 'your_redirect_uri',
  scopes: [LinkedInScope.OFFLINE_ACCESS], // This includes necessary scopes for refresh tokens
});
```

When the access token expires, use the refresh token to get a new one:

```typescript
const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
  await sdk.refreshAccessToken(refreshToken);
```

### Share Content

The SDK provides a dedicated class for sharing content on LinkedIn:

```typescript
import { LinkedInShare } from '@microfox/linkedin-oauth-sdk';

// Initialize with access token
const share = new LinkedInShare(accessToken);

// Share a text post
await share.post({
  text: 'Hello LinkedIn!',
  visibility: 'PUBLIC', // 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN'
});

// Share an article
await share.post({
  text: 'Check out this article!',
  mediaCategory: 'ARTICLE',
  media: [
    {
      url: 'https://example.com/article',
      title: 'Amazing Article',
      description: 'Must-read content',
    },
  ],
});

// Share with custom visibility
await share.post({
  text: 'For my connections only',
  visibility: 'CONNECTIONS',
});
```

## Error Handling

The SDK uses Zod for validation and throws descriptive errors that you can catch and handle:

```typescript
try {
  const { accessToken } = await sdk.exchangeCodeForTokens(code);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Invalid response format:', error.errors);
  } else {
    console.error('Failed to exchange code:', error.message);
  }
}
```

## Types

The SDK exports the following TypeScript types:

```typescript
import type {
  LinkedInScope,
  LinkedInAuthConfig,
  LinkedInProfile,
  LinkedInError,
} from '@microfox/linkedin-oauth-sdk';

// Zod-inferred types
import type {
  TokenResponse,
  ErrorResponse,
} from '@microfox/linkedin-oauth-sdk';
```

### Available Scopes

```typescript
LinkedInScope.OPENID; // OpenID Connect authentication
LinkedInScope.PROFILE; // Basic profile information
LinkedInScope.W_MEMBER_SOCIAL; // Share and interact with content
LinkedInScope.EMAIL; // Access email address
LinkedInScope.OFFLINE_ACCESS; // Enable refresh tokens
```

### Media Categories

```typescript
type LinkedInMediaCategory =
  | 'NONE'
  | 'ARTICLE'
  | 'IMAGE'
  | 'VIDEO'
  | 'DOCUMENT';
```

### Visibility Options

```typescript
type LinkedInVisibility = 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN';
```

## License

MIT
