# publishMedia

Publishes a media container.

## Parameters

- `accountId` (string): The ID of the Instagram account.
- `containerId` (string): The ID of the media container.

## Returns

- `Promise<string>`: A promise that resolves to the ID of the published media.

## Example

```typescript
const mediaId = await sdk.publishMedia('123456789', '17849303057181032');
```