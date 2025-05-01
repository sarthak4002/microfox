## Function: `getUser`

Retrieves information about a specific user.

**Purpose:**
Fetches the user data for the specified username.

**Parameters:**
- `username`: string - The username of the user to retrieve.

**Return Value:**
User - An object containing the user's information.

**Examples:**
```typescript
const user = await sdk.getUser('reddit_username');
console.log(user);
```