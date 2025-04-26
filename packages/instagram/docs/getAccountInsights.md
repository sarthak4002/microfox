# getAccountInsights

Gets insights for an account.

## Parameters

- `accountId` (string): The ID of the Instagram account.
- `insightsData` (object): An object containing the insights data.

## Returns

- `Promise<any>`: A promise that resolves to the insights data.

## Example

```typescript
const insights = await sdk.getAccountInsights('123456789', {
  metric: ['follower_count'],
  period: 'lifetime',
});
```