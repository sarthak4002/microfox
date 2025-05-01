## Function: `submitPost`

Submits a new post to a subreddit.

**Purpose:**
Creates a new text or link post in the specified subreddit.

**Parameters:**
- `subreddit`: string - The name of the subreddit to submit to.
- `title`: string - The title of the post.
- `content`: object<{ text?: string; url?: string }> - The content of the post. Either `text` or `url` must be provided.
  - `text`: string - The text content of a self post.
  - `url`: string - The URL of a link post.

**Return Value:**
Post - The submitted post object.

**Examples:**
```typescript
const post = await sdk.submitPost('AskReddit', 'What is your favorite book?', { text: 'I'm curious to hear your recommendations!' });
console.log(post);
```