## submitComment(parentId, text)

Submits a new comment.

```typescript
const comment = await reddit.submitComment('t3_12345', 'This is a comment!');
console.log(comment);
```

**Parameters:**

- `parentId`: The ID of the parent post or comment.
- `text`: The text of the comment.

**Returns:** A promise that resolves to a Comment object.