## submitPost(subreddit, title, content)

Submits a new post.

```typescript
const post = await reddit.submitPost('typescript', 'New SDK Released!', {
  text: 'Check out the new TypeScript SDK!',
});
console.log(post);
```

**Parameters:**

- `subreddit`: The name of the subreddit to submit the post to.
- `title`: The title of the post.
- `content`: An object containing either `text` for a text post or `url` for a link post.

**Returns:** A promise that resolves to a Post object.
