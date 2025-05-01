## Function: `getUserContent`

Retrieves content (posts and comments) submitted by a specific user.

**Purpose:**
Fetches the user's posts and comments based on the specified section.

**Parameters:**
- `username`: string - The username of the user whose content to retrieve.
- `section`: 'overview' | 'submitted' | 'comments' | 'upvoted' | 'downvoted' | 'hidden' | 'saved' | 'gilded' - The section of content to retrieve.
- `params`: ListingParams - Optional parameters for filtering and sorting the results.
  - `after`: string - The full name of a thing to fetch after.
  - `before`: string - The full name of a thing to fetch before.
  - `count`: number - The number of items already seen in this listing. Starts at 0.
  - `limit`: number - The maximum number of items to return in this slice of the listing.
  - `show`: string - Show specific content (e.g., 'all', 'given').
  - `sr_detail`: string - Expand subreddit information.

**Return Value:**
array<Post | Comment> - An array of posts and comments submitted by the user.

**Examples:**
```typescript
const content = await sdk.getUserContent('reddit_username', 'submitted');
console.log(content);
```