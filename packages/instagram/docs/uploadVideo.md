## Function: `uploadVideo`

Uploads a video to Instagram.

**Purpose:**

This function uploads a video file to a specified media container using a resumable upload process.

**Parameters:**

| Parameter | Type | Required | Description | Constraints | Example | Possible Values |
|-----------|------|----------|-------------|-------------|---------|----------------|
| containerId | `string` | Yes | ID of the media container |  | "178414057900101795" | Any valid media container ID string |
| videoFile | `File` | Yes | Video file to upload |  | See example below | Any valid `File` object |
| offset | `number` | Yes | Starting offset for the upload |  | 0 | Any non-negative integer |

**Return Value:**

| Type | Description | Example | Possible Values |
|------|-------------|---------|----------------|
| `any` | Video upload response data |  |  |

**Examples:**

```typescript
// Example: Uploading a video
const videoFile = new File(['video data'], 'video.mp4', { type: 'video/mp4' });
const uploadResponse = await instagramSDK.uploadVideo('178414057900101795', videoFile, 0);
```