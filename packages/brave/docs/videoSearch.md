## Function: `videoSearch`

Performs a video search using the Brave Search API.

**Purpose:**
Retrieves video search results for a given query and optional parameters.

**Parameters:**

- `params`: object<VideoSearchParams> - Required. Video search parameters.
  - `q`: string - Required. The search query (maximum 400 characters).
  - `country`: string - Optional. Two-letter country code (e.g., "US").
  - `search_lang`: string - Optional. Language code (e.g., "en", "es"). Minimum 2 characters.
  - `ui_lang`: string - Optional. UI language code (e.g., "en-US"). Must match the regex /^[a-z]{2}-[A-Z]{2}$/.
  - `count`: number - Optional. Number of results to return (integer between 1 and 50). Defaults to 10.
  - `offset`: number - Optional. Offset for pagination (integer between 0 and 9).
  - `spellcheck`: boolean - Optional. Whether to enable spellcheck.
  - `safesearch`: enum<SafeSearchOption> - Optional. SafeSearch option. Possible values: "off", "moderate", "strict".
  - `freshness`: enum<FreshnessOption> | string - Optional. Freshness option. Possible values: "pd", "pw", "pm", "py", or a date range in the format "YYYY-MM-DDtoYYYY-MM-DD".

**Return Value:**

- `Promise<any>` - A promise that resolves to the video search results.

**Examples:**

```typescript
// Example 1: Minimal usage
const results = await braveSDK.videoSearch({ q: 'music' });

// Example 2: Full usage
const results = await braveSDK.videoSearch({
  q: 'coding',
  country: 'CA',
  search_lang: 'de',
  ui_lang: 'de-DE',
  count: 25,
  offset: 5,
  spellcheck: true,
  safesearch: 'off',
  freshness: 'pm',
});
```
