## Function: `getUserPreferences`

Retrieves the preferences of the currently authenticated user.

**Purpose:**
Fetches the user's preferences.

**Parameters:**
None

**Return Value:**
Record<string, unknown> - An object containing the user's preferences.

**Examples:**
```typescript
const prefs = await sdk.getUserPreferences();
console.log(prefs);
```