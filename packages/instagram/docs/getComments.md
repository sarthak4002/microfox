## Function: `getComments`

Gets comments for a media object.

**Purpose:**

This function retrieves comments associated with a given media ID.

**Parameters:**

| Parameter | Type | Required | Description | Constraints | Example | Possible Values |
|-----------|------|----------|-------------|-------------|---------|----------------|
| mediaId | `string` | Yes | ID of the media object |  | "178414057900101796" | Any valid media ID string |

**Return Value:**

| Type | Description | Example | Possible Values |
|------|-------------|---------|----------------|
| `any` | Comments data |  |  |

**Examples:**

```typescript
// Example: Getting comments for a media object
const comments = await instagramSDK.getComments('178414057900101796');
```