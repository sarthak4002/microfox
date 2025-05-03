## Function: `listGroups`

Lists all groups belonging to the authenticated user.

**Purpose:**
This function retrieves a list of all groups that the authenticated user has access to.

**Parameters:**

- `params`: `object` (optional)
  - An object containing optional parameters for filtering the list of groups.
  - **Fields:**
    - `mine`: `boolean` (optional)
      - Set to `true` to retrieve only groups owned by the authenticated user.
    - `id`: `string` (optional)
      - The ID of a specific group to retrieve.
    - `onBehalfOfContentOwner`: `string` (optional)
      - The ID of the content owner to retrieve groups for.

**Return Value:**

- `Promise<GroupListResponse>`
  - A promise that resolves to an object containing the list of groups.
  - **Fields:**
    - `kind`: `string`
      - Always "youtubeAnalytics#groupListResponse".
    - `items`: `array<Group>`
      - An array of `Group` objects.
      - **Element Fields:**
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
    - `nextPageToken`: `string` (optional)
      - A token to retrieve the next page of results.

**Examples:**

```typescript
// Example usage
const groups = await sdk.listGroups();
console.log(groups);

// Example usage with optional parameters
const myGroups = await sdk.listGroups({ mine: true });
console.log(myGroups);
```