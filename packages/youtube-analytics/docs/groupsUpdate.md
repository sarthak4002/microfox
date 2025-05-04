## Function: `groupsUpdate`

Updates an existing YouTube Analytics group.

**Parameters:**

- `params`: `GroupUpdateParams`
  - `onBehalfOfContentOwner`: `string` - Optional content owner ID.
- `group`: `any` - The group resource to be updated.

**Return Value:**

- `Promise<any>`

**Examples:**

```typescript
const updatedGroup = await sdk.groupsUpdate({}, {
  id: 'groupId',
  snippet: { title: 'Updated Group' },
});
```