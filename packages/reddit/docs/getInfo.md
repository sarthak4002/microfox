## Function: `getInfo`

Retrieves information about multiple items (posts, comments, or subreddits) by their IDs.

**Purpose:**
Fetches data for multiple items at once.

**Parameters:**
- `ids`: array<string> - An array of full names of items to retrieve (e.g., ['t3_12345', 't1_67890']).

**Return Value:**
array<Post | Comment | Subreddit> - An array of objects containing information about the requested items.

**Examples:**
```typescript
const items = await sdk.getInfo(['t3_12345', 't1_67890']);
console.log(items);
```