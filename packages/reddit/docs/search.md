## search(query, params)

Searches for posts and comments across all of Reddit.

```typescript
const results = await reddit.search('typescript sdk', { sort: 'relevance' });
console.log(results);
```

**Parameters:**

- `query`: The search query.
- `params`: Optional search parameters (e.g., sort, t, limit, after, before).

**Returns:** A promise that resolves to an array of SearchResult objects.