## Function: `getMoreComments`

Retrieves additional comments for a post.

**Purpose:**
Fetches more comments that are not initially loaded in a post's comment tree.

**Parameters:**
- `linkId`: string - The full name of the post (e.g., 't3_12345').
- `children`: array<string> - An array of comment IDs to retrieve.

**Return Value:**
array<Comment> - An array of comment objects.

**Examples:**
```typescript
const moreComments = await sdk.getMoreComments('t3_12345', ['t1_abcdef', 't1_ghijkl']);
console.log(moreComments);
```