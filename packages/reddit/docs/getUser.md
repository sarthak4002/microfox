## getUser(username)

Retrieves information about a specific user.

```typescript
const user = await reddit.getUser('some_username');
console.log(user);
```

**Parameters:**

- `username`: The username of the user to retrieve.

**Returns:** A promise that resolves to a User object.