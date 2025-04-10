# @microfox/linkedin-oauth

A robust TypeScript SDK for LinkedIn OAuth 2.0 authentication.

## Features

- 📘 Full TypeScript support with type definitions
- 🔐 OAuth 2.0 authentication flow
- 🔑 Comprehensive LinkedIn API scopes
- 🛡️ Built-in CSRF protection with state parameter
- ⚠️ Error handling with descriptive messages
- 🔍 Zod schema validation for responses
- 🔄 Refresh token support
- 🔍 Token validation and introspection

## Installation

```bash
npm install @microfox/linkedin-oauth
# or
yarn add @microfox/linkedin-oauth
# or
pnpm add @microfox/linkedin-oauth
```

## Usage

### Basic Setup

```typescript
import { LinkedInOAuthSdk, LinkedInScope } from '@microfox/linkedin-oauth';

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

### Refresh Tokens

To enable refresh tokens, include the `OFFLINE_ACCESS` scope when initializing the SDK:

```typescript
const sdk = new LinkedInOAuthSdk({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  redirectUri: 'your_redirect_uri',
  scopes: [LinkedInScope.OFFLINE_ACCESS],
});

// When the access token expires, use the refresh token to get a new one:
const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
  await sdk.refreshAccessToken(refreshToken);
```

### Validate Access Tokens

You can validate access tokens to check if they're still valid:

```typescript
try {
  const result = await sdk.validateAccessToken(accessToken);
  if (result.isValid) {
    console.log('Token is valid');
    console.log('Expires at:', new Date(result.expiresAt!).toISOString());
    console.log('Scopes:', result.scopes);
  } else {
    console.error('Token validation failed:', result.error);
  }
} catch (error) {
  console.error('Validation error:', error);
}
```

### State Parameter

The SDK automatically generates and manages a state parameter for CSRF protection. You can access it if needed:

```typescript
const state = await sdk.getState();
```

## Error Handling

The SDK uses Zod for validation and throws descriptive errors:

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

```typescript
import type {
  LinkedInScope,
  LinkedInAuthConfig,
} from '@microfox/linkedin-oauth';

// Zod-inferred types
import type { TokenResponse, ErrorResponse } from '@microfox/linkedin-oauth';
```

### Available Scopes

The SDK provides a comprehensive set of LinkedIn API scopes:

#### OpenID Connect Scopes
- `LinkedInScope.OPENID` (`openid`) - OpenID Connect authentication
- `LinkedInScope.PROFILE` (`profile`) - Basic profile information
- `LinkedInScope.EMAIL` (`email`) - Access email address

#### Basic Profile Scopes
- `LinkedInScope.BASIC_PROFILE` (`r_basicprofile`) - Read basic profile information
- `LinkedInScope.FULL_PROFILE` (`r_fullprofile`) - Read full profile information

#### Contact Scopes
- `LinkedInScope.CONTACTS` (`r_contacts`) - Access to contacts
- `LinkedInScope.CONTACTS_READONLY` (`r_contacts_readonly`) - Read-only access to contacts

#### Email Scopes
- `LinkedInScope.EMAIL_ADDRESS` (`r_emailaddress`) - Access to email address

#### Organization Scopes
- `LinkedInScope.ORGANIZATION` (`r_organization_social`) - Access to organization data
- `LinkedInScope.ORGANIZATION_ADMIN` (`w_organization_social`) - Admin access to organization data

#### Content Sharing Scopes
- `LinkedInScope.SHARE` (`w_member_social`) - Share and interact with content
- `LinkedInScope.SHARE_READONLY` (`r_member_social`) - Read-only access to shared content

#### Job Posting Scopes
- `LinkedInScope.JOBS` (`w_job_posting`) - Post and manage job listings
- `LinkedInScope.JOBS_READONLY` (`r_job_posting`) - Read-only access to job listings

#### Company Scopes
- `LinkedInScope.COMPANY` (`r_company_admin`) - Admin access to company data
- `LinkedInScope.COMPANY_READONLY` (`r_company_admin_readonly`) - Read-only access to company data

#### Groups Scopes
- `LinkedInScope.GROUPS` (`r_groups`) - Access to groups
- `LinkedInScope.GROUPS_READONLY` (`r_groups_readonly`) - Read-only access to groups

#### Ads Scopes
- `LinkedInScope.ADS` (`r_ads`) - Access to ads
- `LinkedInScope.ADS_READONLY` (`r_ads_readonly`) - Read-only access to ads
- `LinkedInScope.ADS_REPORTING` (`r_ads_reporting`) - Access to ads reporting

#### Marketing Developer Platform Scopes
- `LinkedInScope.MARKETING` (`r_marketing`) - Access to marketing data
- `LinkedInScope.MARKETING_READONLY` (`r_marketing_readonly`) - Read-only access to marketing data

#### Offline Access
- `LinkedInScope.OFFLINE_ACCESS` (`r_liteprofile r_emailaddress w_member_social offline_access`) - Enable refresh tokens (includes r_liteprofile, r_emailaddress, w_member_social, and offline_access)

### Configuration

```typescript
interface LinkedInAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes?: LinkedInScope[];
  state?: string;
}
```

## Security Best Practices

This SDK implements several security features:

- CSRF protection using state parameter (auto-generated if not provided)
- Input validation using Zod schemas
- Type-safe token handling
- Token validation and introspection

Best practices for implementation:

- Store client credentials securely (use environment variables)
- Keep access and refresh tokens secure
- Use HTTPS for all OAuth endpoints
- Always verify the state parameter on callbacks
- Implement proper session management
- Never expose tokens in client-side code or URLs
- Regularly validate access tokens before use

## License

MIT
