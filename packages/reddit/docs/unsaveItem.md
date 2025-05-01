## Function: `unsaveItem`

Unsaves a post or comment.

**Purpose:**
Removes a post or comment from the saved list.

**Parameters:**
- `id`: string - The full name of the item to unsave (e.g., 't3_12345').

**Return Value:**
void

**Examples:**
```typescript
await sdk.unsaveItem('t3_12345');
```