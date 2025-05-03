## Function: `listGroupItems`

Lists all items within a specific group.

**Purpose:**
This function retrieves a list of all items belonging to a specific group.

**Parameters:**

- `params`: `object` (required)
  - An object containing the parameters for listing group items.
  - **Fields:**
    - `groupId`: `string` (required)
      - The ID of the group to list items for.
    - `onBehalfOfContentOwner`: `string` (optional)
      - The ID of the content owner to list items for.

**Return Value:**

- `Promise<GroupItemListResponse>`
  - A promise that resolves to an object containing the list of group items.
  - **Fields:**
    - `kind`: `string`
      - Always "youtubeAnalytics#groupItemListResponse".
    - `items`: `array<GroupItem>`
      - An array of `GroupItem` objects.
      - **Element Fields:**
        - `kind`: `string`
          - Always "youtubeAnalytics#groupItem".
        - `id`: `string`
          - The ID of the group item.
        - `groupId`: `string`
          - The ID of the group the item belongs to.
        - `resource`: `object`
          - **Fields:**
            - `kind`: `string`
              - The kind of resource.
            - `id`: `string`
              - The ID of the resource.
    - `nextPageToken`: `string` (optional)
      - A token to retrieve the next page of results.

**Examples:**

```typescript
// Example usage
const groupItems = await sdk.listGroupItems({ groupId: '<group_id>' });
console.log(groupItems);
```