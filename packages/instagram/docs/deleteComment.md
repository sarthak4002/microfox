## Function: `deleteComment`

Deletes a comment on Instagram.

**Purpose:**

This function permanently deletes a specific comment.

**Parameters:**

| Parameter | Type | Required | Description | Constraints | Example | Possible Values |
|-----------|------|----------|-------------|-------------|---------|----------------|
| commentId | `string` | Yes | ID of the comment to delete |  | "17895705777297547" | Any valid comment ID string |

**Return Value:**

| Type | Description | Example | Possible Values |
|------|-------------|---------|----------------|
| `void` |  |  |  |

**Examples:**

```typescript
// Example: Deleting a comment
await instagramSDK.deleteComment('17895705777297547');
```