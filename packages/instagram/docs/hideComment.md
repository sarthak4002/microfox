# hideComment

Hides or unhides a comment.

## Parameters

- `commentId` (string): The ID of the comment to hide or unhide.
- `hide` (boolean): Whether to hide the comment.

## Returns

- `Promise<void>`: A promise that resolves when the comment has been hidden or unhidden.

## Example

```typescript
await sdk.hideComment('12345678901234567', true);
```