## Function: `summarizerSearch`

Retrieves summarizer search results from the Brave Search API.

**Purpose:**
Gets summarized information for a given key and optional parameters.

**Parameters:**
- `params`: object<SummarizerSearchParams> - Required. Summarizer search parameters.
  - `key`: string - Required. The summarizer key.
  - `entity_info`: boolean - Optional. Whether to include entity information.

**Return Value:**
- `Promise<any>` - A promise that resolves to the summarizer search results.

**Examples:**
```typescript
// Example 1: Minimal usage
const summary = await braveSDK.summarizerSearch({ key: 'elon musk' });

// Example 2: Full usage
const summary = await braveSDK.summarizerSearch({
  key: 'artificial intelligence',
  entity_info: true
});
```