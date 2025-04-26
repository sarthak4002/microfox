## vote(id, direction)

Votes on a post or comment.

```typescript
// Upvote a post
await reddit.vote('t3_12345', '1');

// Downvote a comment
await reddit.vote('t1_67890', '-1');

// Remove a vote
await reddit.vote('t3_12345', '0');
```

**Parameters:**

- `id`: The ID of the post or comment to vote on.
- `direction`: The vote direction ('1' for upvote, '-1' for downvote, '0' for no vote).