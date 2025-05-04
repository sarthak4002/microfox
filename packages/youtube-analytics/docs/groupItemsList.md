## Function: `groupItemsList`

Lists items in a YouTube Analytics group.

**Parameters:**

- `params`: `GroupItemsListParams`
  - `groupId`: `string` - Non-empty string ID. Required.
  - `onBehalfOfContentOwner`: `string` - Optional content owner ID.

**Return Value:**

- `Promise<any>`

**Examples:**

```typescript
const groupItems = await sdk.groupItemsList({ groupId: 'groupId' });
```