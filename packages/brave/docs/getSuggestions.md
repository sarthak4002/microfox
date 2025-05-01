## Function: `getSuggestions`

Retrieves search suggestions from the Brave Search API.

**Purpose:**
Gets search suggestions for a given query and optional parameters.

**Parameters:**

- `params`: object<SuggestSearchParams> - Required. Suggest search parameters.
  - `q`: string - Required. The search query (maximum 400 characters).
  - `country`: string - Optional. Two-letter country code (e.g., "US").
  - `lang`: string - Optional. Language code (e.g., "en", "es"). Minimum 2 characters.
  - `count`: number - Optional. Number of suggestions to return (integer between 1 and 20). Defaults to 10.
  - `rich`: boolean - Optional. Whether to include rich suggestions.

**Return Value:**

- `Promise<any>` - A promise that resolves to the search suggestions.

**Examples:**

```typescript
// Example 1: Minimal usage
const suggestions = await braveSDK.getSuggestions({ q: 'brave' });

// Example 2: Full usage
const suggestions = await braveSDK.getSuggestions({
  q: 'search',
  country: 'JP',
  lang: 'ja',
  count: 15,
  rich: true,
});
```
