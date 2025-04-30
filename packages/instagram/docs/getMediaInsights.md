# getMediaInsights

Gets insights for a media object.

## Parameters

- `mediaId` (string): The ID of the media object.
- `insightsData` (object): An object containing the insights data.

## Returns

- `Promise<any>`: A promise that resolves to the insights data.

## Example

```typescript
const insights = await sdk.getMediaInsights('12345678901234567', {
  metric: ['impressions', 'reach'],
  period: 'day',
});
```
