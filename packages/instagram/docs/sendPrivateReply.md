# sendPrivateReply

Sends a private reply to a comment.

## Parameters

- `userId` (string): The ID of the user to send the private reply to.
- `replyData` (object): An object containing the reply data.

## Returns

- `Promise<any>`: A promise that resolves to the response data.

## Example

```typescript
const response = await sdk.sendPrivateReply('123456789', {
  recipient: { comment_id: '12345678901234567' },
  message: { text: 'This is a private reply' },
});
```
