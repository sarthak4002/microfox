## editUserText(id, text)

Edits the text of a post or comment.

```typescript
const editedPost = await reddit.editUserText('t3_12345', 'Updated post text');
console.log(editedPost);
```

**Parameters:**

- `id`: The ID of the post or comment to edit.
- `text`: The new text.

**Returns:** A promise that resolves to the updated Post or Comment object.
