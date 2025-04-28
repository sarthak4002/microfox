# getMediaContainerStatus

Gets the status of a media container.

## Parameters

- `containerId` (string): The ID of the media container.

## Returns

- `Promise<string>`: A promise that resolves to the status code of the media container.

## Example

```typescript
const status = await sdk.getMediaContainerStatus('17849303057181032');
```
