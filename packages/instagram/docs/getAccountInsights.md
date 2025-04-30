## Function: `getAccountInsights`

Gets insights for an Instagram account.

**Purpose:**

This function retrieves insights data for a specific Instagram account.

**Parameters:**

| Parameter | Type | Required | Description | Constraints | Example | Possible Values |
|-----------|------|----------|-------------|-------------|---------|----------------|
| accountId | `string` | Yes | Instagram account ID |  | "1234567890" | Any valid Instagram account ID string |
| insightsData | `InstagramInsightsSchema` | Yes | Insights data object | See `InstagramInsightsSchema` type details | See example below |  |

**Type Details:**

### InstagramInsightsSchema
Schema for retrieving Instagram insights.

| Field | Type | Required | Description | Constraints | Example | Possible Values |
|-------|------|----------|-------------|-------------|---------|----------------|
| metric | `array` | Yes | Array of metric names to retrieve |  | `['impressions', 'reach']` | Array of strings |
| period | `enum` | Yes | Time period for the metrics | One of: 'day', 'week', 'days_28', 'lifetime' | "day" | 'day', 'week', 'days_28', 'lifetime' |

**Return Value:**

| Type | Description | Example | Possible Values |
|------|-------------|---------|----------------|
| `any` | Account insights data |  |  |

**Examples:**

```typescript
// Example: Getting account insights
const insights = await instagramSDK.getAccountInsights('1234567890', {
  metric: ['impressions', 'reach'],
  period: 'day'
});
```