Initializes a new instance of the `GoogleSearchConsoleSDK`.

This SDK allows you to interact with the Google Search Console API. You can use it to manage sites, sitemaps, search analytics, and URL inspection data.

**Usage Example:**

```typescript
import { createGoogleSearchConsoleSDK } from 'google-search-console';

const sdk = createGoogleSearchConsoleSDK({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
  accessToken: process.env.GOOGLE_ACCESS_TOKEN,
});

// Use the SDK to interact with the Google Search Console API
const sites = await sdk.listSites();
console.log(sites);
```