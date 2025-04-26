# replyToComment

Replies to a comment.

## Parameters

- `commentId` (string): The ID of the comment to reply to.
- `replyData` (object): An object containing the reply data.

## Returns

- `Promise<string>`: A promise that resolves to the ID of the new reply comment.

## Example

```typescript
const replyId = await sdk.replyToComment('12345678901234567', {
  message: 'This is a reply',
});
```