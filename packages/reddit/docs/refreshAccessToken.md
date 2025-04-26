## refreshAccessToken()

Refreshes the access token using the refresh token.

```typescript
const refreshToken = 'your_refresh_token';
await reddit.refreshAccessToken(refreshToken);
```

**Parameters:**

- `refreshToken`: The refresh token obtained during the initial authorization.