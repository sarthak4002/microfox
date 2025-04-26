## getUserPreferences()

Retrieves the preferences of the currently authenticated user.

```typescript
const prefs = await reddit.getUserPreferences();
console.log(prefs);
```

**Returns:** A promise that resolves to an object containing the user's preferences.