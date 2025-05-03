## Constructor: `YouTubeAnalyticsAPISDK`

Initializes a new instance of the `YouTubeAnalyticsAPISDK`.

**Parameters:**

- `params`: `YouTubeAnalyticsAPISDKParams` (required)
  - An object containing the necessary parameters to initialize the SDK.
  - **Fields:**
    - `clientId`: `string` (required)
      - Your OAuth 2.0 client ID.
      - Obtain this from your Google Cloud Console.
    - `clientSecret`: `string` (required)
      - Your OAuth 2.0 client secret.
      - Obtain this from your Google Cloud Console.
    - `redirectUri`: `string` (required)
      - Your authorized redirect URI.
      - This should match the redirect URI configured in your Google Cloud Console.
    - `accessToken`: `string` (required)
      - The OAuth 2.0 access token.
      - Obtain this after completing the OAuth 2.0 flow.

**Examples:**

```typescript
// Example using environment variables
const sdk = new YouTubeAnalyticsAPISDK({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_REDIRECT_URI!,
  accessToken: process.env.GOOGLE_ACCESS_TOKEN!
});
```