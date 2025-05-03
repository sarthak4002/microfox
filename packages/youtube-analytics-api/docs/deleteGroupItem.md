## Function: `deleteGroupItem`

Deletes a group item.

**Purpose:**
This function deletes an existing item from a specific group.

**Parameters:**

- `id`: `string` (required)
  - The ID of the group item to delete.
- `onBehalfOfContentOwner`: `string` (optional)
  - The ID of the content owner to delete the item for.

**Return Value:**

- `Promise<void>`
  - A promise that resolves when the group item has been deleted.

**Examples:**

```typescript
// Example usage
await sdk.deleteGroupItem('<group_item_id>');
```