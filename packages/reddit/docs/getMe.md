## getMe()

Retrieves information about the currently authenticated user.

```typescript
const me = await reddit.getMe();
console.log(me);
```

**Returns:** A promise that resolves to a User object.