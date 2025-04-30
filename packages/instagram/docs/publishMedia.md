## Function: `publishMedia`

Publishes a media container to Instagram.

**Purpose:**

This function publishes the media associated with a given container ID to the specified Instagram account.

**Parameters:**

| Parameter | Type | Required | Description | Constraints | Example | Possible Values |
|-----------|------|----------|-------------|-------------|---------|----------------|
| accountId | `string` | Yes | Instagram account ID |  | "1234567890" | Any valid Instagram account ID string |
| containerId | `string` | Yes | ID of the media container |  | "178414057900101795" | Any valid media container ID string |

**Return Value:**

| Type | Description | Example | Possible Values |
|------|-------------|---------|----------------|
| `string` | ID of the published media | "178414057900101796" | Any valid media ID string |

**Examples:**

```typescript
// Example: Publishing a media container
const mediaId = await instagramSDK.publishMedia('1234567890', '178414057900101795');
```