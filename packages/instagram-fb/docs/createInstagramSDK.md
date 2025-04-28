# InstagramSDK Constructor

Initializes a new instance of the InstagramSDK.

```typescript
import { createInstagramSDK } from 'your-package-name';

const sdk = createInstagramSDK({
  clientId: process.env.INSTAGRAM_CLIENT_ID,
  clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
  redirectUri: process.env.INSTAGRAM_REDIRECT_URI,
  accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
});
```

**Parameters:**

- `config`: An object with the following properties:
  - `clientId`: Your Facebook App ID.
  - `clientSecret`: Your Facebook App Secret.
  - `redirectUri`: Your OAuth callback URL.
  - `accessToken`: A valid access token for the Instagram Graph API.
  - `apiVersion` (optional): The API version to use (defaults to 'v22.0').

**Usage:**

```typescript
// Validate the access token
await sdk.validateAccessToken();

// Refresh the access token
const newAccessToken = await sdk.refreshAccessToken('your-refresh-token');

// Create a media container
const mediaContainer = await sdk.createMediaContainer('your-instagram-id', {
  image_url: 'https://example.com/image.jpg',
  media_type: 'IMAGE',
});
```
