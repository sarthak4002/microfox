## Function: `updateGroup`

Updates an existing group.

**Purpose:**
This function updates the properties of an existing group.

**Parameters:**

- `group`: `Group` (required)
  - An object containing the updated properties of the group.
  - **Fields:**
    - `kind`: `string` (required)
      - Always "youtubeAnalytics#group".
    - `id`: `string` (required)
      - The ID of the group to update.
    - `snippet`: `object` (required)
      - **Fields:**
        - `title`: `string` (required)
          - The title of the group.
        - `description`: `string` (optional)
          - The description of the group.
    - `contentDetails`: `object` (required)
      - **Fields:**
        - `itemType`: `string` (required)
          - The type of items in the group.
        - `itemCount`: `number` (optional)
          - The number of items in the group.

**Return Value:**

- `Promise<Group>`
  - A promise that resolves to the updated `Group` object.

**Examples:**

```typescript
// Example usage
const updatedGroup = await sdk.updateGroup({
  kind: "youtubeAnalytics#group",
  id: "<group_id>",
  snippet: {
    title: "Updated Group Title",
    description: "Updated group description"
  },
  contentDetails: {
    itemType: "youtube#video",
    itemCount: 10
  }
});
console.log(updatedGroup);
```