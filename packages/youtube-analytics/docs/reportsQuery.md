## Function: `reportsQuery`

Queries YouTube Analytics reports.

**Parameters:**

- `params`: `ReportsQueryParams`
  - `endDate`: `string` - Date in YYYY-MM-DD format. Required.
  - `ids`: `string` - Non-empty string ID. Required.
  - `metrics`: `string` - Comma-separated list of metrics. Required.
  - `startDate`: `string` - Date in YYYY-MM-DD format. Required.
  - `currency`: `string` - Optional three-letter ISO 4217 currency code.
  - `dimensions`: `string` - Optional comma-separated list of dimensions.
  - `filters`: `string` - Optional filters for data.
  - `includeHistoricalChannelData`: `boolean` - Optional boolean value.
  - `maxResults`: `number` - Optional integer value.
  - `sort`: `string` - Optional sorting criteria.
  - `startIndex`: `number` - Optional integer value.

**Return Value:**

- `Promise<any>`

**Examples:**

```typescript
const reportData = await sdk.reportsQuery({
  ids: 'channel==MINE',
  startDate: '2023-01-01',
  endDate: '2023-12-31',
  metrics: 'views,likes,dislikes',
});
```