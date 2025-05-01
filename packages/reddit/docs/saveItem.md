## Function: `saveItem`

Saves a post or comment.

**Purpose:**
Saves a post or comment for later viewing.

**Parameters:**
- `id`: string - The full name of the item to save (e.g., 't3_12345').
- `category`: string - An optional category to save the item under.

**Return Value:**
void

**Examples:**
```typescript
await sdk.saveItem('t3_12345');
```