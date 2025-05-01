## Function: `vote`

Votes on a post or comment.

**Purpose:**
Casts an upvote, downvote, or removes a vote on a post or comment.

**Parameters:**
- `id`: string - The full name of the item to vote on (e.g., 't3_12345').
- `direction`: number<VoteDirection> - The vote direction (1 for upvote, -1 for downvote, 0 to remove vote).

**Return Value:**
void

**Examples:**
```typescript
await sdk.vote('t3_12345', 1); // Upvote
```