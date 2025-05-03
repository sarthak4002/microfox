## Function: `reportsQuery`

Retrieves YouTube Analytics data for a given set of parameters.

**Purpose:**

This function allows you to query the YouTube Analytics API and retrieve data for various metrics and dimensions.

**Parameters:**

- `params`: `ReportQueryParams` (required)
  - An object containing the parameters for the report query.
  - **Fields:**
    - `ids`: `string` (required)
      - Identifies the channel or content owner.
    - `startDate`: `string` (required)
      - Start date for the report (YYYY-MM-DD).
    - `endDate`: `string` (required)
      - End date for the report (YYYY-MM-DD).
    - `metrics`: `string` (required)
      - Comma-separated list of metrics.
    - `dimensions`: `string` (optional)
      - Comma-separated list of dimensions.
    - `filters`: `string` (optional)
      - Filtering criteria.
    - `sort`: `string` (optional)
      - Comma-separated list of dimensions or metrics to sort by.
    - `maxResults`: `number` (optional)
      - Maximum number of rows to return.
    - `startIndex`: `number` (optional)
      - Index of the first row to return.
    - `currency`: `string` (optional)
      - Currency for monetary reports (ISO 4217 currency code).
    - `includeHistoricalChannelData`: `boolean` (optional)
      - Include historical data for channel.

**Return Value:**

- `Promise<ReportResponse>`
  - A promise that resolves to an object containing the report data.
  - **Fields:**
    - `kind`: `string`
      - Always "youtubeAnalytics#report".
    - `columnHeaders`: `array<object>`
      - An array of column headers.
      - **Element Fields:**
        - `name`: `string`
          - The name of the column.
        - `columnType`: `string`
          - The type of the column.
        - `dataType`: `string`
          - The data type of the column.
    - `rows`: `array<array<any>>`
      - An array of rows, where each row is an array of values.

**Examples:**

```typescript
// Example usage
const response = await sdk.reportsQuery({
  ids: 'channel==<channel_id>',
  startDate: '2023-01-01',
  endDate: '2023-12-31',
  metrics: 'views,likes,dislikes'
});

console.log(response);
```