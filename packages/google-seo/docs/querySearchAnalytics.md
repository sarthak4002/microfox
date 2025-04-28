Queries search analytics data for a specific site.

**Code Example:**

```typescript
const data = await sdk.querySearchAnalytics('https://www.example.com/', {
  startDate: '2023-01-01',
  endDate: '2023-12-31',
  dimensions: ['query'],
});
console.log(data);
```
