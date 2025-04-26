## updateUserPreferences()

Updates the preferences of the currently authenticated user.

```typescript
const newPrefs = { ... };
const updatedPrefs = await reddit.updateUserPreferences(newPrefs);
console.log(updatedPrefs);
```

**Parameters:**

- `prefs`: An object containing the new preferences.