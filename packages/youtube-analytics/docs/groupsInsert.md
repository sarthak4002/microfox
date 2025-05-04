## Function: `groupsInsert`

Inserts a new YouTube Analytics group.

**Parameters:**

- `params`: `GroupInsertParams`
  - `onBehalfOfContentOwner`: `string` - Optional content owner ID.
- `group`: `any` - The group resource to be inserted.

**Return Value:**

- `Promise<any>`

**Examples:**

```typescript
const newGroup = await sdk.groupsInsert({}, {
  snippet: { title: 'New Group' },
  contentDetails: { itemType: 'youtube#video' },
});
```