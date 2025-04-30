## Function: `replyToComment`

Replies to a comment on Instagram.

**Purpose:**

This function creates a reply to an existing comment.

**Parameters:**

| Parameter | Type | Required | Description | Constraints | Example | Possible Values |
|-----------|------|----------|-------------|-------------|---------|----------------|
| commentId | `string` | Yes | ID of the comment to reply to |  | "17895705777297547" | Any valid comment ID string |
| replyData | `InstagramCommentSchema` | Yes | Reply data object | See `InstagramCommentSchema` type details | See example below |  |

**Type Details:**

### InstagramCommentSchema
Schema for creating or replying to comments.

| Field | Type | Required | Description | Constraints | Example | Possible Values |
|-------|------|----------|-------------|-------------|---------|----------------|
| message | `string` | Yes | Text content of the comment |  | "This is a reply" | Any string |

**Return Value:**

| Type | Description | Example | Possible Values |
|------|-------------|---------|----------------|
| `string` | ID of the created reply | "17895705777297548" | Any valid comment ID string |

**Examples:**

```typescript
// Example: Replying to a comment
const replyId = await instagramSDK.replyToComment('17895705777297547', {
  message: 'This is a reply'
});
```