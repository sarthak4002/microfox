## Function: `toggleComments`

Toggles comments on or off for a media object.

**Purpose:**

This function enables or disables comments for a specific media object.

**Parameters:**

| Parameter | Type | Required | Description | Constraints | Example | Possible Values |
|-----------|------|----------|-------------|-------------|---------|----------------|
| mediaId | `string` | Yes | ID of the media object |  | "178414057900101796" | Any valid media ID string |
| enable | `boolean` | Yes | Whether to enable comments (`true`) or disable them (`false`) |  | true | true or false |

**Return Value:**

| Type | Description | Example | Possible Values |
|------|-------------|---------|----------------|
| `void` |  |  |  |

**Examples:**

```typescript
// Example 1: Enabling comments
await instagramSDK.toggleComments('178414057900101796', true);

// Example 2: Disabling comments
await instagramSDK.toggleComments('178414057900101796', false);
```