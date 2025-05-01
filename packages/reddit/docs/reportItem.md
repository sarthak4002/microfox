## Function: `reportItem`

Reports a post or comment.

**Purpose:**
Reports a post or comment to Reddit moderators.

**Parameters:**
- `id`: string - The full name of the item to report (e.g., 't3_12345').
- `reason`: string - The reason for reporting the item.

**Return Value:**
void

**Examples:**
```typescript
await sdk.reportItem('t3_12345', 'This is spam.');
```