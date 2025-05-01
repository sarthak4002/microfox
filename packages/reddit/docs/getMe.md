## Function: `getMe`

Retrieves information about the currently authenticated user.

**Purpose:**
Fetches the user data for the authenticated user.

**Parameters:**
None

**Return Value:**
User - An object containing the user's information.

**Examples:**
```typescript
const me = await sdk.getMe();
console.log(me);
```