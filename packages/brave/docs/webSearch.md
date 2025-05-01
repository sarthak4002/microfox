## Function: `webSearch`

Performs a web search using the Brave Search API.

**Purpose:**
Retrieves web search results for a given query and optional parameters.

**Parameters:**
- `params`: object<WebSearchParams> - Required. Web search parameters.
  - `q`: string - Required. The search query (maximum 400 characters).
  - `country`: string - Optional. Two-letter country code (e.g., "US").
  - `search_lang`: string - Optional. Language code (e.g., "en", "es"). Minimum 2 characters.
  - `ui_lang`: string - Optional. UI language code (e.g., "en-US"). Must match the regex /^[a-z]{2}-[A-Z]{2}$/.
  - `count`: number - Optional. Number of results to return (integer between 1 and 20). Defaults to 10.
  - `offset`: number - Optional. Offset for pagination (integer between 0 and 9).
  - `safesearch`: enum<SafeSearchOption> - Optional. SafeSearch option. Possible values: "off", "moderate", "strict".
  - `freshness`: enum<FreshnessOption> | string - Optional. Freshness option. Possible values: "pd", "pw", "pm", "py", or a date range in the format "YYYY-MM-DDtoYYYY-MM-DD".
  - `text_decorations`: boolean - Optional. Whether to include text decorations.
  - `spellcheck`: boolean - Optional. Whether to enable spellcheck.

**Return Value:**
- `Promise<any>` - A promise that resolves to the web search results.

**Examples:**
```typescript
// Example 1: Minimal usage
const results = await braveSDK.webSearch({ q: 'test' });

// Example 2: Full usage
const results = await braveSDK.webSearch({
  q: 'technology',
  country: 'US',
  search_lang: 'en',
  ui_lang: 'en-US',
  count: 20,
  offset: 0,
  safesearch: 'moderate',
  freshness: 'pw',
  text_decorations: true,
  spellcheck: true
});
```