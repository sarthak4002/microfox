## Function: `getMediaContainerStatus`

Gets the status of a media container.

**Purpose:**

This function retrieves the current status of a media container, which indicates the progress of the media upload and processing.

**Parameters:**

| Parameter | Type | Required | Description | Constraints | Example | Possible Values |
|-----------|------|----------|-------------|-------------|---------|----------------|
| containerId | `string` | Yes | ID of the media container |  | "178414057900101795" | Any valid media container ID string |

**Return Value:**

| Type | Description | Example | Possible Values |
|------|-------------|---------|----------------|
| `string` | Status code of the media container | "FINISHED" |  |

**Examples:**

```typescript
// Example: Getting the status of a media container
const status = await instagramSDK.getMediaContainerStatus('178414057900101795');
```