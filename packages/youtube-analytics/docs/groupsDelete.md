## Function: `groupsDelete`

Deletes a YouTube Analytics group.

**Parameters:**

- `params`: `GroupDeleteParams`
  - `id`: `string` - Non-empty string ID. Required.
  - `onBehalfOfContentOwner`: `string` - Optional content owner ID.

**Return Value:**

- `Promise<void>`

**Examples:**

```typescript
await sdk.groupsDelete({ id: 'groupId' });
```