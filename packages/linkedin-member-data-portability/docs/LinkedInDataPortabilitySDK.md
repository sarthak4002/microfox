# LinkedInDataPortabilitySDK

The `LinkedInDataPortabilitySDK` class provides methods to interact with the LinkedIn Data Portability API.

## Constructor

```typescript
constructor(config: {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken: string;
  refreshToken?: string;
})
```

**Parameters:**

- `config`: An object with the following properties:
  - `clientId`: Your LinkedIn app's Client ID.
  - `clientSecret`: Your LinkedIn app's Client Secret.
  - `redirectUri`: The redirect URI registered in your LinkedIn app.
  - `accessToken`: The OAuth 2.0 access token for authenticated requests.
  - `refreshToken`: (Optional) The refresh token to obtain new access tokens.

**Usage Example:**

```typescript
import { createLinkedInSDK } from './LinkedInDataPortabilitySDK';

const sdk = createLinkedInSDK({
  clientId: process.env.LINKEDIN_CLIENT_ID!,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
  redirectUri: process.env.LINKEDIN_REDIRECT_URI!,
  accessToken: process.env.LINKEDIN_ACCESS_TOKEN!,
  refreshToken: process.env.LINKEDIN_REFRESH_TOKEN,
});
```
