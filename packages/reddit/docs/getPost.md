## getPost(id)

Retrieves a specific post by its ID.

```typescript
const post = await reddit.getPost('t3_12345');
console.log(post);
```

**Parameters:**

- `id`: The ID of the post to retrieve.

**Returns:** A promise that resolves to a Post object.