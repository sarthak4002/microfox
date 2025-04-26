Initializes a new instance of the GoogleAnalyticsSDK.

Authentication is handled using OAuth 2.0. You will need to provide your client ID, client secret, redirect URI, and access token. The SDK uses the `@microfox/google-oauth` package for OAuth 2.0 functionalities.

Usage Example:
```typescript
import { createGoogleAnalyticsSDK } from 'google-analytics-sdk';

const sdk = createGoogleAnalyticsSDK({
  clientId: process.env.GOOGLE_ANALYTICS_CLIENT_ID,
  clientSecret: process.env.GOOGLE_ANALYTICS_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_ANALYTICS_REDIRECT_URI,
  accessToken: process.env.GOOGLE_ANALYTICS_ACCESS_TOKEN,
});

// Use the sdk object to interact with the Google Analytics Data API
```

Parameters:
- `config`: An object containing the following properties:
  - `clientId`: The client ID for your Google Cloud project.
  - `clientSecret`: The client secret for your Google Cloud project.
  - `redirectUri`: The redirect URI for your Google Cloud project.
  - `accessToken`: The access token for authenticating with the Google Analytics Data API.

Note:
- You can obtain the necessary credentials by setting up a Google Cloud project, enabling the Google Analytics Data API, and creating OAuth 2.0 credentials.
- Store your client ID, client secret, redirect URI, and access token securely. Never commit these to version control.
- Use environment variables to manage your credentials.
- Refresh the access token when necessary using the `refreshAccessToken` method.