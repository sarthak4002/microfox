## Function: `deleteGroup`

Deletes a group.

**Purpose:**
This function deletes an existing group.

**Parameters:**

- `id`: `string` (required)
  - The ID of the group to delete.
- `onBehalfOfContentOwner`: `string` (optional)
  - The ID of the content owner to delete the group for.

**Return Value:**

- `Promise<void>`
  - A promise that resolves when the group has been deleted.

**Examples:**

```typescript
// Example usage
await sdk.deleteGroup('<group_id>');
```