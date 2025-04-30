## Function: `createMediaContainer`

Creates a media container on Instagram.

**Purpose:**

This function initiates the media upload process by creating a container that will hold the media data.

**Parameters:**

| Parameter | Type | Required | Description | Constraints | Example | Possible Values |
|-----------|------|----------|-------------|-------------|---------|----------------|
| accountId | `string` | Yes | Instagram account ID |  | "1234567890" | Any valid Instagram account ID string |
| mediaData | `InstagramMediaSchema` | Yes | Media data object | See `InstagramMediaSchema` type details | See examples below |  |

**Type Details:**

### InstagramMediaSchema
Schema for creating media on Instagram.

| Field | Type | Required | Description | Constraints | Example | Possible Values |
|-------|------|----------|-------------|-------------|---------|----------------|
| image_url | `string` | No | URL of the image to be published | Must be a valid URL | "https://example.com/image.jpg" | Any valid URL string |
| video_url | `string` | No | URL of the video to be published | Must be a valid URL | "https://example.com/video.mp4" | Any valid URL string |
| media_type | `enum` | Yes | Type of media | One of: 'IMAGE', 'VIDEO', 'REELS', 'STORIES', 'CAROUSEL' | "IMAGE" | 'IMAGE', 'VIDEO', 'REELS', 'STORIES', 'CAROUSEL' |
| caption | `string` | No | Caption for the media |  | "This is a caption" | Any string |
| location_id | `string` | No | ID of the location to tag |  | "1234567890" | Any string |
| user_tags | `array` | No | Array of user tags |  | `[{ username: 'user1', x: 0.5, y: 0.5 }]` | Array of objects with `username`, `x`, and `y` properties |
| is_carousel_item | `boolean` | No | Whether this media is part of a carousel |  | true | true or false |
| children | `array` | No | Array of media IDs for carousel posts |  | `['media_id_1', 'media_id_2']` | Array of strings |

**Return Value:**

| Type | Description | Example | Possible Values |
|------|-------------|---------|----------------|
| `string` | ID of the created media container | "178414057900101795" | Any valid media container ID string |

**Examples:**

```typescript
// Example 1: Creating an image container
const containerId = await instagramSDK.createMediaContainer('1234567890', {
  image_url: 'https://example.com/image.jpg',
  media_type: 'IMAGE',
  caption: 'This is an image'
});

// Example 2: Creating a video container
const containerId = await instagramSDK.createMediaContainer('1234567890', {
  video_url: 'https://example.com/video.mp4',
  media_type: 'VIDEO',
  caption: 'This is a video'
});
```