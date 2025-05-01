## Function: `imageSearch`

Performs an image search using the Brave Search API.

**Purpose:**
Retrieves image search results for a given query and optional parameters.

**Parameters:**
- `params`: object<ImageSearchParams> - Required. Image search parameters.
  - `q`: string - Required. The search query (maximum 400 characters).
  - `country`: string - Optional. Two-letter country code (e.g., "US").
  - `search_lang`: string - Optional. Language code (e.g., "en", "es"). Minimum 2 characters.
  - `count`: number - Optional. Number of results to return (integer between 1 and 100). Defaults to 10.
  - `safesearch`: enum<SafeSearchOption> - Optional. SafeSearch option. Possible values: "off", "moderate", "strict".
  - `spellcheck`: boolean - Optional. Whether to enable spellcheck.

**Return Value:**
- `Promise<any>` - A promise that resolves to the image search results.

**Examples:**
```typescript
// Example 1: Minimal usage
const results = await braveSDK.imageSearch({ q: 'cat' });

// Example 2: Full usage
const results = await braveSDK.imageSearch({
  q: 'dogs',
  country: 'UK',
  search_lang: 'fr',
  count: 50,
  safesearch: 'strict',
  spellcheck: false
});
```