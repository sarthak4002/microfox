## Function: `getPost`

Retrieves a specific post by its ID.

**Purpose:**
Fetches a single post by its full name.

**Parameters:**
- `id`: string - The full name of the post to retrieve (e.g., 't3_12345').

**Return Value:**
Post - The requested post object.

**Examples:**
```typescript
const post = await sdk.getPost('t3_12345');
console.log(post);
```