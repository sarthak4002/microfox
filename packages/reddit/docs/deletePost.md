## Function: `deletePost`

Deletes a post or comment.

**Purpose:**
Removes a post or comment from Reddit.

**Parameters:**
- `id`: string - The full name of the item to delete (e.g., 't3_12345').

**Return Value:**
void

**Examples:**
```typescript
await sdk.deletePost('t3_12345');
```