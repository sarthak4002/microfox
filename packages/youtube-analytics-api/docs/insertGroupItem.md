## Function: `insertGroupItem`

Creates a new group item.

**Purpose:**
This function creates a new item within a specific group.

**Parameters:**

- `groupItem`: `Omit<GroupItem, 'id'>` (required)
  - An object containing the properties of the new group item, excluding the `id` field.
  - **Fields:**
    - `kind`: `string` (required)
      - Always "youtubeAnalytics#groupItem".
    - `groupId`: `string` (required)
      - The ID of the group to add the item to.
    - `resource`: `object` (required)
      - **Fields:**
        - `kind`: `string` (required)
          - The kind of resource.
        - `id`: `string` (required)
          - The ID of the resource.

**Return Value:**

- `Promise<GroupItem>`
  - A promise that resolves to the newly created `GroupItem` object.

**Examples:**

```typescript
// Example usage
const newGroupItem = await sdk.insertGroupItem({
  kind: "youtubeAnalytics#groupItem",
  groupId: "<group_id>",
  resource: {
    kind: "youtube#video",
    id: "<video_id>"
  }
});
console.log(newGroupItem);
```