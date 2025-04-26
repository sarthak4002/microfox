# getOEmbedData

Gets oEmbed data for an Instagram post.

## Parameters

- `oembedData` (object): An object containing the oEmbed data.

## Returns

- `Promise<any>`: A promise that resolves to the oEmbed data.

## Example

```typescript
const oembed = await sdk.getOEmbedData({
  url: 'https://www.instagram.com/p/1234567890',
});
```