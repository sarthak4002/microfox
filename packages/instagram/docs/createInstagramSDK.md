# createInstagramSDK

Creates an instance of the InstagramSDK.

## Parameters

- `config` (object): An object containing the following properties:
    - `accessToken` (string): The user's access token.
    - `refreshToken` (string): The user's refresh token.
    - `clientId` (string): Your Instagram app's Client ID.
    - `clientSecret` (string): Your Instagram app's Client Secret.
    - `redirectUri` (string): The OAuth redirect URI for your app.

## Returns

- `InstagramSDK`: An instance of the InstagramSDK.

## Example

```typescript
import { createInstagramSDK } from '@microfox/instagram-sdk';

const sdk = createInstagramSDK({
  accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
  refreshToken: process.env.INSTAGRAM_REFRESH_TOKEN,
  clientId: process.env.INSTAGRAM_CLIENT_ID,
  clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
  redirectUri: process.env.INSTAGRAM_REDIRECT_URI,
});
```