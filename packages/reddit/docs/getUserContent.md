## getUserContent(username, section, params)

Retrieves content (posts and comments) submitted by a specific user.

```typescript
const content = await reddit.getUserContent('some_username', 'submitted', {
  limit: 50,
});
console.log(content);
```

**Parameters:**

- `username`: The username of the user whose content to retrieve.
- `section`: The section of the user's profile to retrieve content from (e.g., 'overview', 'submitted', 'comments').
- `params`: Optional listing parameters (e.g., limit, after, before).

**Returns:** A promise that resolves to an array of Post or Comment objects.
