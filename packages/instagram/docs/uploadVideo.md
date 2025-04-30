# uploadVideo

Uploads a video to a media container.

## Parameters

- `containerId` (string): The ID of the media container.
- `videoFile` (File): The video file to upload.
- `offset` (number): The starting offset for the upload.

## Returns

- `Promise<any>`: A promise that resolves to the upload response data.

## Example

```typescript
const uploadResponse = await sdk.uploadVideo('17849303057181032', videoFile, 0);
```
