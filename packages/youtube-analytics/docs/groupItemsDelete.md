## Function: `groupItemsDelete`

Deletes an item from a YouTube Analytics group.

**Parameters:**

- `params`: `GroupItemsDeleteParams`
  - `id`: `string` - Non-empty string ID. Required.
  - `onBehalfOfContentOwner`: `string` - Optional content owner ID.

**Return Value:**

- `Promise<void>`

**Examples:**

```typescript
await sdk.groupItemsDelete({ id: 'groupItemId' });
```