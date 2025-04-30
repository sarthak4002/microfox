## Function: `sendPrivateReply`

Sends a private reply to a comment on Instagram.

**Purpose:**

This function sends a private reply to a user regarding a specific comment.

**Parameters:**

| Parameter | Type | Required | Description | Constraints | Example | Possible Values |
|-----------|------|----------|-------------|-------------|---------|----------------|
| userId | `string` | Yes | ID of the user to reply to |  | "1234567890" | Any valid user ID string |
| replyData | `InstagramPrivateReplySchema` | Yes | Private reply data object | See `InstagramPrivateReplySchema` type details | See example below |  |

**Type Details:**

### InstagramPrivateReplySchema
Schema for sending private replies.

| Field | Type | Required | Description | Constraints | Example | Possible Values |
|-------|------|----------|-------------|-------------|---------|----------------|
| recipient | `object` | Yes | Recipient information |  | `{ comment_id: '17895705777297547' }` | Object with `comment_id` property |
| message | `object` | Yes | Message content |  | `{ text: 'This is a private reply' }` | Object with `text` property |

**Return Value:**

| Type | Description | Example | Possible Values |
|------|-------------|---------|----------------|
| `any` | Private reply response data |  |  |

**Examples:**

```typescript
// Example: Sending a private reply
const replyResponse = await instagramSDK.sendPrivateReply('1234567890', {
  recipient: { comment_id: '17895705777297547' },
  message: { text: 'This is a private reply' }
});
```