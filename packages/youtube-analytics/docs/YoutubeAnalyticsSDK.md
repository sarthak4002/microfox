## Constructor: `YoutubeAnalyticsSDK`

Initializes a new instance of the YoutubeAnalyticsSDK.

**Parameters:**

- `params`: `object`
  - `accessToken`: `string` - OAuth 2.0 access token. Required.
  - `refreshToken`: `string` - Optional OAuth 2.0 refresh token.
  - `clientId`: `string` - OAuth 2.0 client ID. Required.
  - `clientSecret`: `string` - OAuth 2.0 client secret. Required.
  - `redirectUri`: `string` - OAuth 2.0 redirect URI. Required.

**Examples:**

```typescript
const sdk = new YoutubeAnalyticsSDK({
  accessToken: process.env.GOOGLE_ACCESS_TOKEN,
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});
```