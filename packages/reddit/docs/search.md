## Function: `search`

Searches across all of Reddit.

**Purpose:**
Searches for posts and other content across all subreddits.

**Parameters:**
- `query`: string - The search query.
- `params`: ListingParams & { sort?: 'relevance' | 'hot' | 'top' | 'new' | 'comments'; t?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' } - Optional parameters for filtering and sorting the results.
  - `after`: string - The full name of a thing to fetch after.
  - `before`: string - The full name of a thing to fetch before.
  - `count`: number - The number of items already seen in this listing. Starts at 0.
  - `limit`: number - The maximum number of items to return in this slice of the listing.
  - `show`: string - Show specific content (e.g., 'all', 'given').
  - `sr_detail`: string - Expand subreddit information.
  - `sort`: 'relevance' | 'hot' | 'top' | 'new' | 'comments' - The sorting method for the search results.
  - `t`: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' - The time period to search within.

**Return Value:**
array<SearchResult> - An array of search results.

**Examples:**
```typescript
const results = await sdk.search('technology');
console.log(results);
```