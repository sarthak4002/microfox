# toggleComments

Enables or disables comments on a media object.

## Parameters

- `mediaId` (string): The ID of the media object.
- `enable` (boolean): Whether to enable comments.

## Returns

- `Promise<void>`: A promise that resolves when comments have been enabled or disabled.

## Example

```typescript
await sdk.toggleComments('12345678901234567', false);
```
