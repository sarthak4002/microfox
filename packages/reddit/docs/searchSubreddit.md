## searchSubreddit(subreddit, query, params)

Searches for posts and comments within a specific subreddit.

```typescript
const results = await reddit.searchSubreddit('typescript', 'sdk', { sort: 'relevance' });
console.log(results);
```

**Parameters:**

- `subreddit`: The name of the subreddit to search within.
- `query`: The search query.
- `params`: Optional search parameters (e.g., sort, t, limit, after, before).

**Returns:** A promise that resolves to an array of SearchResult objects.