# Google OAuth SDK

A lightweight TypeScript SDK for Google OAuth token management with built-in token validation and refresh capabilities. This module is part of the `@microfox/google` npm package.

## Installation

```bash
npm install @microfox/google
```

## Features

- Token validation against Google's tokeninfo endpoint
- Automatic token refresh using refresh tokens
- Strong typing with Zod schema validation
- Simple interface for token management
- Reusable across multiple Google API SDKs

## Usage

### Basic Usage

```typescript
import { createGoogleOAuthManager } from '@microfox/google';

// Set up token management
const tokens = await createGoogleOAuthManager({
  accessToken: 'your-access-token',
  refreshToken: 'your-refresh-token',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
});

// Use the validated/refreshed token
console.log(tokens.accessToken); // Valid token
console.log(tokens.expiresAt); // Expiration timestamp
```

### Integrating with API Clients

This module is designed to be integrated with other Google API clients like Drive SDK, YouTube SDK, etc.

```typescript
import {
  createGoogleOAuthManager,
  GoogleOAuthOptions,
} from '@microfox/google';
import { createRestSDK } from '@microfox/rest-sdk';

const createMyGoogleApiClient = async (options: GoogleOAuthOptions) => {
  // Validate and refresh tokens if needed
  const tokens = await createGoogleOAuthManager(options);

  // Create API client with the valid token
  const restSdk = createRestSDK({
    baseUrl: 'https://api.google.com/some-service',
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });

  // Return your API methods
  return {
    // Your API methods using restSdk
  };
};
```

## API Reference

### `createGoogleOAuthManager(options)`

Main function that checks if a token is valid and refreshes it if necessary.

**Parameters:**

- `options` (GoogleOAuthOptions): Object containing:
  - `accessToken` (string): The access token to validate/use
  - `refreshToken` (string, optional): Refresh token to use if access token is invalid
  - `clientId` (string, optional): OAuth client ID required for token refresh
  - `clientSecret` (string, optional): OAuth client secret required for token refresh

**Returns:**

- Promise\<Tokens>: Object containing:
  - `accessToken` (string): A valid access token (if refresh was successful) or the original token
  - `refreshToken` (string, optional): The refresh token provided
  - `expiresAt` (number, optional): Timestamp when the token expires
  - `tokenType` (string, optional): Token type (usually "Bearer")

### `isTokenValid(accessToken)`

Checks if an access token is valid by querying the Google tokeninfo endpoint.

**Parameters:**

- `accessToken` (string): The access token to validate

**Returns:**

- Promise\<boolean>: True if the token is valid, false otherwise

### `refreshAccessToken(refreshToken, clientId, clientSecret)`

Refreshes an access token using a refresh token.

**Parameters:**

- `refreshToken` (string): The refresh token
- `clientId` (string): OAuth client ID
- `clientSecret` (string): OAuth client secret

**Returns:**

- Promise\<object | null>: Object containing the new access token and expiration, or null if refresh failed

## Type Definitions

### GoogleOAuthOptions

```typescript
interface GoogleOAuthOptions {
  accessToken: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
}
```

### Tokens

```typescript
interface Tokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
}
```

## Environment Variables

The SDK can also use these environment variables for client credentials:

```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
```

## Error Handling

The SDK uses Zod for validation and provides meaningful error messages when validation fails. All asynchronous operations are properly try-catched to prevent uncaught promise rejections.

## Related Packages

- `@microfox/drive` - Google Drive API SDK
- `@microfox/youtube` - YouTube API SDK
- `@microfox/rest-sdk` - REST client used by Google SDKs
