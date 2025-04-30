## Function: `getOEmbedData`

Gets oEmbed data for an Instagram post.

**Purpose:**

This function retrieves oEmbed data for a given Instagram post URL.

**Parameters:**

| Parameter | Type | Required | Description | Constraints | Example | Possible Values |
|-----------|------|----------|-------------|-------------|---------|----------------|
| oembedData | `InstagramOEmbedSchema` | Yes | oEmbed data object | See `InstagramOEmbedSchema` type details | See example below |  |

**Type Details:**

### InstagramOEmbedSchema
Schema for retrieving oEmbed data for an Instagram post.

| Field | Type | Required | Description | Constraints | Example | Possible Values |
|-------|------|----------|-------------|-------------|---------|----------------|
| url | `string` | Yes | URL of the Instagram post to embed | Must be a valid URL | "https://www.instagram.com/p/post-id/" | Any valid URL string |
| maxwidth | `number` | No | Maximum width of the embedded content |  | 640 | Any non-negative integer |
| fields | `array` | No | Specific fields to include in the response |  | `['author_name', 'media_id']` | Array of strings |
| omit_script | `boolean` | No | Whether to omit the script tag in the response |  | true | true or false |

**Return Value:**

| Type | Description | Example | Possible Values |
|------|-------------|---------|----------------|
| `any` | oEmbed data |  |  |

**Examples:**

```typescript
// Example: Getting oEmbed data
const oembed = await instagramSDK.getOEmbedData({
  url: 'https://www.instagram.com/p/post-id/'
});
```