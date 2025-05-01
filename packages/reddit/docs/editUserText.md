## Function: `editUserText`

Edits the text of a self post or comment.

**Purpose:**
Modifies the text content of an existing post or comment.

**Parameters:**
- `id`: string - The full name of the item to edit (e.g., 't3_12345').
- `text`: string - The new text content.

**Return Value:**
Post | Comment - The edited post or comment object.

**Examples:**
```typescript
const editedPost = await sdk.editUserText('t3_12345', 'Edited post text.');
console.log(editedPost);
```