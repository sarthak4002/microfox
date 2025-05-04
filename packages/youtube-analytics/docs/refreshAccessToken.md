## Function: `refreshAccessToken`

Refreshes the OAuth 2.0 access token.

**Parameters:**

- `refreshToken`: `string` - OAuth 2.0 refresh token. Required.

**Return Value:**

- `{ accessToken: string; expiresIn: number }`
  - `accessToken`: `string` - New OAuth 2.0 access token.
  - `expiresIn`: `number` - Token expiration time in seconds.

**Examples:**

```typescript
const newTokens = await sdk.refreshAccessToken('refreshToken');
```