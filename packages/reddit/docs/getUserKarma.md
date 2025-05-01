## Function: `getUserKarma`

Retrieves the karma breakdown for the currently authenticated user.

**Purpose:**
Fetches the user's karma information.

**Parameters:**
None

**Return Value:**
Record<string, { link_karma: number; comment_karma: number }> - An object containing the user's karma breakdown.

**Examples:**
```typescript
const karma = await sdk.getUserKarma();
console.log(karma);
```