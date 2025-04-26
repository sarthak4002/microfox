## validateAccessToken()

Validates the current access token.

```typescript
const isValid = await reddit.validateAccessToken();
console.log(isValid);
```

**Returns:** A promise that resolves to a boolean indicating whether the access token is valid.