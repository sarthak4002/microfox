# createMediaContainer

Creates a media container on Instagram.

## Parameters

- `accountId` (string): The ID of the Instagram account.
- `mediaData` (object): An object containing the media data.

## Returns

- `Promise<string>`: A promise that resolves to the ID of the created media container.

## Example

```typescript
const containerId = await sdk.createMediaContainer('123456789', {
  image_url: 'https://example.com/image.jpg',
  media_type: 'IMAGE',
  caption: 'My image',
});
```