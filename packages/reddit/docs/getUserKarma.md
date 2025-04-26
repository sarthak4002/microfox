## getUserKarma()

Retrieves the karma of the currently authenticated user.

```typescript
const karma = await reddit.getUserKarma();
console.log(karma);
```

**Returns:** A promise that resolves to an object containing the user's karma.