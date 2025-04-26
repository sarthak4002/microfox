## getOEmbed(url, maxwidth, fields, omitScript)

Retrieves oEmbed data for a given URL.

**Parameters:**

- `url`: The URL to retrieve oEmbed data for.
- `maxwidth` (optional): The maximum width of the embed.
- `fields` (optional): An array of fields to include in the response.
- `omitScript` (optional): Whether to omit the script tag in the embed HTML.

**Returns:**

- The oEmbed response data.

**Example:**

```typescript
const oEmbedData = await sdk.getOEmbed('https://www.instagram.com/p/your-post-id/');
console.log('oEmbed data:', oEmbedData);
```