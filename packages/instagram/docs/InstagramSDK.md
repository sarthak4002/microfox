## Constructor: `InstagramSDK`

Initializes a new instance of the InstagramSDK.

**Purpose:**

The constructor sets up the necessary configurations for interacting with the Instagram Graph API, including authentication and API access.

**Parameters:**

| Parameter | Type | Required | Description | Constraints | Example | Possible Values |
|-----------|------|----------|-------------|-------------|---------|----------------|
| config | `object` | Yes | Configuration object for the SDK | Must contain valid `accessToken`, `refreshToken`, `clientId`, `clientSecret`, and `redirectUri` | See examples below |  |

**Type Details:**

### config
Configuration object for the SDK.

| Field | Type | Required | Description | Constraints | Example | Possible Values |
|-------|------|----------|-------------|-------------|---------|----------------|
| accessToken | `string` | Yes | User's access token | Obtained through OAuth flow | "YOUR_ACCESS_TOKEN" | Any valid access token string |
| refreshToken | `string` | Yes | User's refresh token | Obtained through OAuth flow | "YOUR_REFRESH_TOKEN" | Any valid refresh token string |
| clientId | `string` | Yes | App's Client ID | Obtained from Facebook Developer app dashboard | "YOUR_CLIENT_ID" | Any valid Client ID string |
| clientSecret | `string` | Yes | App's Client Secret | Obtained from Facebook Developer app dashboard | "YOUR_CLIENT_SECRET" | Any valid Client Secret string |
| redirectUri | `string` | Yes | OAuth redirect URI | Must match a valid redirect URI configured in your app dashboard | "https://your-redirect-uri.com" | Any valid URL string |

**Examples:**

```typescript
// Example 1: Using configuration object
const instagramSDK = new InstagramSDK({
  accessToken: 'YOUR_ACCESS_TOKEN',
  refreshToken: 'YOUR_REFRESH_TOKEN',
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  redirectUri: 'https://your-redirect-uri.com'
});

// Example 2: Using environment variables
const instagramSDK = new InstagramSDK({
  accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
  refreshToken: process.env.INSTAGRAM_REFRESH_TOKEN || '',
  clientId: process.env.INSTAGRAM_CLIENT_ID || '',
  clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
  redirectUri: process.env.INSTAGRAM_REDIRECT_URI || ''
});
```