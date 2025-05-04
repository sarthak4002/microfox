## Function: `groupsList`

Lists YouTube Analytics groups.

**Parameters:**

- `params`: `GroupListParams`
  - `id`: `string` - Optional comma-separated list of group IDs.
  - `mine`: `boolean` - Set to true to retrieve all groups owned by the authenticated user.
  - `onBehalfOfContentOwner`: `string` - Optional content owner ID.
  - `pageToken`: `string` - Optional token for pagination.

**Return Value:**

- `Promise<any>`

**Examples:**

```typescript
const groups = await sdk.groupsList({});
```