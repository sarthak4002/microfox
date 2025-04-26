# getContentPublishingLimit

Gets the content publishing limit for an account.

## Parameters

- `accountId` (string): The ID of the Instagram account.

## Returns

- `Promise<any>`: A promise that resolves to the content publishing limit data.

## Example

```typescript
const limit = await sdk.getContentPublishingLimit('123456789');
```