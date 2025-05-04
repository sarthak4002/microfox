## Function: `groupItemsInsert`

Inserts a new item into a YouTube Analytics group.

**Parameters:**

- `params`: `GroupItemsInsertParams`
  - `onBehalfOfContentOwner`: `string` - Optional content owner ID.
- `groupItem`: `any` - The group item resource to be inserted.

**Return Value:**

- `Promise<any>`

**Examples:**

```typescript
const newGroupItem = await sdk.groupItemsInsert({}, {
  groupId: 'groupId',
  resource: { kind: 'youtube#video', id: 'videoId' },
});
```