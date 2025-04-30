## Function: `hideComment`

Hides or unhides a comment on Instagram.

**Purpose:**

This function allows you to hide or unhide a specific comment.

**Parameters:**

| Parameter | Type | Required | Description | Constraints | Example | Possible Values |
|-----------|------|----------|-------------|-------------|---------|----------------|
| commentId | `string` | Yes | ID of the comment to hide/unhide |  | "17895705777297547" | Any valid comment ID string |
| hide | `boolean` | Yes | Whether to hide the comment (`true`) or unhide it (`false`) |  | true | true or false |

**Return Value:**

| Type | Description | Example | Possible Values |
|------|-------------|---------|----------------|
| `void` |  |  |  |

**Examples:**

```typescript
// Example 1: Hiding a comment
await instagramSDK.hideComment('17895705777297547', true);

// Example 2: Unhiding a comment
await instagramSDK.hideComment('17895705777297547', false);
```