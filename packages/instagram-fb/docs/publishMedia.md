## publishMedia(igId, creationId)

Publishes a media container.

**Parameters:**

- `igId`: The Instagram ID.
- `creationId`: The ID of the media container to publish.

**Returns:**

- The ID of the published media.

**Example:**

```typescript
const publishedMediaId = await sdk.publishMedia('your-instagram-id', 'your-creation-id');
console.log('Published media ID:', publishedMediaId);
```