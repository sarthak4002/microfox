## Function: `spellcheck`

Performs a spellcheck using the Brave Search API.

**Purpose:**
Checks the spelling of a given query and returns corrected suggestions.

**Parameters:**

- `params`: object<SpellcheckParams> - Required. Spellcheck parameters.
  - `q`: string - Required. The search query (maximum 400 characters).
  - `country`: string - Optional. Two-letter country code (e.g., "US").
  - `lang`: string - Optional. Language code (e.g., "en", "es"). Minimum 2 characters.

**Return Value:**

- `Promise<any>` - A promise that resolves to the spellcheck results.

**Examples:**

```typescript
// Example 1: Minimal usage
const spellcheckResults = await braveSDK.spellcheck({ q: 'helo' });

// Example 2: Full usage
const spellcheckResults = await braveSDK.spellcheck({
  q: 'programing',
  country: 'IN',
  lang: 'hi',
});
```
