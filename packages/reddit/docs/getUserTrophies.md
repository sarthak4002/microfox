## Function: `getUserTrophies`

Retrieves the trophies for the currently authenticated user.

**Purpose:**
Fetches the user's trophies.

**Parameters:**
None

**Return Value:**
unknown - An object representing the user's trophies.

**Examples:**
```typescript
const trophies = await sdk.getUserTrophies();
console.log(trophies);
```