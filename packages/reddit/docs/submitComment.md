## Function: `submitComment`

Submits a comment to a post or comment.

**Purpose:**
Adds a new comment to a post or another comment.

**Parameters:**
- `parentId`: string - The full name of the parent post or comment (e.g., 't3_12345').
- `text`: string - The text of the comment.

**Return Value:**
Comment - The submitted comment object.

**Examples:**
```typescript
const comment = await sdk.submitComment('t3_12345', 'This is a comment.');
console.log(comment);
```