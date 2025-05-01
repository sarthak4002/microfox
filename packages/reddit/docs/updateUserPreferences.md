## Function: `updateUserPreferences`

Updates the preferences of the currently authenticated user.

**Purpose:**
Modifies the user's preferences.

**Parameters:**
- `prefs`: Record<string, unknown> - An object containing the new preferences.

**Return Value:**
Record<string, unknown> - An object containing the updated preferences.

**Examples:**
```typescript
const updatedPrefs = await sdk.updateUserPreferences({ nightmode: true });
console.log(updatedPrefs);
```