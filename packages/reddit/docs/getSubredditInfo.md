## Function: `getSubredditInfo`

Retrieves information about a specific subreddit.

**Purpose:**
Fetches the subreddit's information.

**Parameters:**
- `subreddit`: string - The name of the subreddit to retrieve.

**Return Value:**
Subreddit - An object containing the subreddit's information.

**Examples:**
```typescript
const subreddit = await sdk.getSubredditInfo('AskReddit');
console.log(subreddit);
```