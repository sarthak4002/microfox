## Constructor: `createBraveSDK`

Creates a new instance of the BraveSDK client, which allows you to interact with the Brave Search API.

**Purpose:**
Initializes a new BraveSDK object with the provided configuration options.

**Parameters:**

- `options`: object<BraveSDKOptions> - Required. SDK configuration options.
  - `apiKey`: string - Required. Your Brave Search API key.
  - `baseUrl`: string - Optional. The base URL for the Brave Search API. Defaults to `https://api.search.brave.com/res/v1`.

**Return Value:**

- `BraveSDK` - A new instance of the BraveSDK client.

**Examples:**

```typescript
// Example 1: Minimal usage with required arguments
const braveSDK = createBraveSDK({
  apiKey: process.env.BRAVE_API_KEY, // Replace with your actual API key
});

// Example 2: Full usage with optional arguments
const braveSDK = createBraveSDK({
  apiKey: process.env.BRAVE_API_KEY, // Replace with your actual API key
  baseUrl: 'https://api.search.brave.com/res/v1',
});
```
