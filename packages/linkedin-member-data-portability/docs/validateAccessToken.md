## validateAccessToken()

Validates the current access token.

```typescript
async validateAccessToken(): Promise<void>
```

**Returns:**

- `Promise<void>`: Resolves if the access token is valid, rejects otherwise.

**Throws:**

- `Error`: If the access token is invalid or if validation fails.