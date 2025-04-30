## validateAccessToken()

Validates the current access token.

**Throws:**

- `Error`: If the access token is invalid.

**Example:**

```typescript
try {
  await sdk.validateAccessToken();
  console.log('Access token is valid');
} catch (error) {
  console.error('Access token is invalid:', error);
}
```
