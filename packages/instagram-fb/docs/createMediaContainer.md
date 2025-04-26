## createMediaContainer(igId, params)

Creates a media container.

**Parameters:**

- `igId`: The Instagram ID.
- `params`: An object with the following properties:
  - `image_url`: The URL of the image.
  - `video_url`: The URL of the video.
  - `media_type`: The media type ('IMAGE', 'VIDEO', 'REELS', 'STORIES', 'CAROUSEL').
  - `is_carousel_item`: Whether the media is a carousel item.
  - `upload_type`: The upload type ('resumable').

**Returns:**

- The ID of the created media container.

**Example:**

```typescript
const mediaContainer = await sdk.createMediaContainer('your-instagram-id', {
  image_url: 'https://example.com/image.jpg',
  media_type: 'IMAGE',
});
console.log('Media container ID:', mediaContainer.id);
```