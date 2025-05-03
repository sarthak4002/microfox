## Function: `insertGroup`

Creates a new group.

**Purpose:**
This function creates a new group with the specified properties.

**Parameters:**

- `group`: `Omit<Group, 'id'>` (required)
  - An object containing the properties of the new group, excluding the `id` field.
  - **Fields:**
    - `kind`: `string` (required)
      - Always "youtubeAnalytics#group".
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
  - A promise that resolves to the newly created `Group` object.
  - **Fields:**
    - `kind`: `string`
      - Always "youtubeAnalytics#group".
    - `id`: `string`
      - The ID of the group.
    - `snippet`: `object`
      - **Fields:**
        - `title`: `string`
          - The title of the group.
        - `description`: `string` (optional)
          - The description of the group.
    - `contentDetails`: `object`
      - **Fields:**
        - `itemType`: `string`
          - The type of items in the group.
        - `itemCount`: `number` (optional)
          - The number of items in the group.

**Examples:**

```typescript
// Example usage
const newGroup = await sdk.insertGroup({
  kind: "youtubeAnalytics#group",
  snippet: {
    title: "My New Group",
    description: "This is a new group"
  },
  contentDetails: {
    itemType: "youtube#video",
    itemCount: 5
  }
});
console.log(newGroup);
```