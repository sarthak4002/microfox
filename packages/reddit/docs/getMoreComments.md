## getMoreComments(linkId, children)

Retrieves additional comments for a post.

```typescript
const comments = await reddit.getMoreComments('t3_12345', ['t1_67890', 't1_98765']);
console.log(comments);
```

**Parameters:**

- `linkId`: The ID of the post to retrieve comments for.
- `children`: An array of comment IDs to retrieve.

**Returns:** A promise that resolves to an array of Comment objects.