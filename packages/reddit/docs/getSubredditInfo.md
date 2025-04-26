## getSubredditInfo(subreddit)

Retrieves information about a specific subreddit.

```typescript
const subreddit = await reddit.getSubredditInfo('typescript');
console.log(subreddit);
```

**Parameters:**

- `subreddit`: The name of the subreddit to retrieve information about.

**Returns:** A promise that resolves to a Subreddit object.