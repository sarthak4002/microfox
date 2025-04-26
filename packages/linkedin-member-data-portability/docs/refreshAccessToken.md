## refreshAccessToken()

Refreshes the access token using the provided refresh token.

```typescript
async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>
```

**Parameters:**

- `refreshToken`: The refresh token.

**Returns:**

- `Promise<{ accessToken: string; refreshToken: string }>`: An object containing the new access and refresh tokens.

**Throws:**

- `Error`: If refreshing the access token fails.