# Packagefox: Code Generation Report

## Generated Files
| File | Size (bytes) |
|------|-------------|
| src/CoinGeckoSdk.ts | 5490 |
| src/types/index.ts | 4908 |
| src/schemas/index.ts | 4693 |
| src/index.ts | 91 |

## Setup Information
- **Auth Type**: apikey


- **Setup Info**: To use the CoinGecko SDK, you need to obtain an API key from the CoinGecko Pro API.

1. Sign up for a CoinGecko Pro account at https://www.coingecko.com/en/api/pricing
2. Once you have an account, navigate to your dashboard to find your API key
3. Store your API key securely and never share it publicly

To use the SDK:

1. Install the package: `npm install @microfox/coingecko-sdk`
2. Import and initialize the SDK:

```typescript
import { createCoinGeckoSDK } from '@microfox/coingecko-sdk';

const sdk = createCoinGeckoSDK({
  apiKey: 'YOUR_API_KEY_HERE'
});
```

3. You can now use the SDK methods to interact with the CoinGecko API:

```typescript
const bitcoinPrice = await sdk.getSimplePrice({ ids: 'bitcoin', vs_currencies: 'usd' });
console.log(bitcoinPrice);
```

Note: Some endpoints are only available for paid plans. Make sure you have the appropriate subscription level to access all features.

Environment Variables:
You can also use an environment variable to store your API key. Set the `COINGECKO_API_KEY` environment variable, and the SDK will automatically use it if no API key is provided during initialization.



---
**Total Usage:** Total Bytes: 15182 | Tokens: 369986 | Cost: $1.4453