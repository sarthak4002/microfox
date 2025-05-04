## CoinGecko Pro API TypeScript SDK Summary

This document summarizes the CoinGecko Pro API for generating a TypeScript SDK.  All endpoints require a Pro API key.

**Authentication:**

* **Method:**  Header (Recommended) or Query String Parameter
* **Header:** `x-cg-pro-api-key: YOUR_API_KEY`
* **Query String Parameter:** `x_cg_pro_api_key=YOUR_API_KEY`
* **TypeScript Type:** `string`
* **Notes:**
    * Store the API key securely in your backend and use a proxy for best security practices.
    * Avoid using query string parameters as they risk exposing your API key.
    * Root URL for Pro API: `https://pro-api.coingecko.com/api/v3/`
    * On-chain data endpoints include `/onchain` in the path.

---

### Endpoints

**Coins:**

* **`/ping`** (GET)
    * Description: Check API server status.
    * Parameters: None
    * Response: `{ gecko_says: string }` -  `gecko_says` typically contains "(V3) To the Moon!"
    * TypeScript Response Type: `{ gecko_says: string }`

* **`/key`** (GET) - *Paid Plan*
    * Description: Check account's API usage.  This endpoint is not documented in detail, but likely returns usage statistics.
    * Parameters: None.  Authentication is required.
    * Response:  (Assumed) Usage data including credits remaining, rate limits, etc.
    * TypeScript Response Type: `any` (until further documentation is available)


* **`/simple/price`** (GET)
    * Description: Get the current price of one or more coins by ID, symbol, or name.
    * Parameters:
        * `vs_currencies` (string, required): Comma-separated list of target currencies.
        * `ids` (string): Comma-separated list of coin IDs.
        * `names` (string): Comma-separated list of coin names (URL-encoded spaces).
        * `symbols` (string): Comma-separated list of coin symbols.
        * `include_tokens` (string, default 'top'): 'all' for all matching symbols.
        * `include_market_cap` (boolean): Include market cap.
        * `include_24hr_vol` (boolean): Include 24hr volume.
        * `include_24hr_change` (boolean): Include 24hr change.
        * `include_last_updated_at` (boolean): Include last updated timestamp.
        * `precision` (string): Decimal places for price.
    * Response: Nested object with coin IDs/symbols/names as keys, and price data for each currency as values.
    * TypeScript Response Type:  `Record<string, Record<string, number | null>>` (consider a more specific type if possible based on response structure)
    * Edge Cases: Handle potential `null` values for price data if unavailable.

* **`/simple/token_price/{id}`** (GET)
    * Description: Get the current price of tokens on a specific platform (blockchain).  Requires the platform ID (e.g., 'ethereum').
    * Path Parameters:
        * `id` (string, required):  The asset platform ID (e.g., 'ethereum').
    * Parameters:  Similar to `/simple/price`, but operates on token contract addresses instead of coin IDs.  Uses `contract_addresses` instead of `ids`.
    * Response:  Similar structure to `/simple/price`.
    * TypeScript Response Type: `Record<string, Record<string, number | null>>`
    * Edge Cases: Handle `null` values and potential differences in available data compared to `/simple/price`.


* **`/simple/supported_vs_currencies`** (GET)
    * Description: Get a list of supported vs_currencies.
    * Parameters: None
    * Response: Array of strings (currency codes).
    * TypeScript Response Type: `string[]`

* **`/coins/list`** (GET)
    * Description: List all supported coins with ID, name, and symbol.
    * Parameters:
        * `include_platform` (boolean): Include platform and contract addresses.
        * `status` (string, default 'active'): Filter by coin status ('active' or 'inactive').
    * Response: Array of objects: `{ id: string, symbol: string, name: string, platforms: Record<string, string> }`
    * TypeScript Response Type: `{ id: string, symbol: string, name: string, platforms: Record<string, string> }[]`

* **`/coins/markets`** (GET)
    * Description: List coins with market data.
    * Parameters:
        * `vs_currency` (string, required): Target currency.
        * `ids` (string): Comma-separated list of coin IDs.
        * `names` (string): Comma-separated list of coin names (URL-encoded spaces).
        * `symbols` (string): Comma-separated list of coin symbols.
        * `include_tokens` (string, default 'top'): 'all' for all matching symbols.
        * `category` (string): Filter by category.
        * `order` (string): Sort order (e.g., 'market_cap_desc').
        * `per_page` (number): Results per page.
        * `page` (number): Page number.
        * `sparkline` (boolean): Include sparkline data.
        * `price_change_percentage` (string): Comma-separated list of price change percentage timeframes (e.g., '1h,24h,7d').
        * `locale` (string): Language.
        * `precision` (string): Decimal places.
    * Response: Array of objects with detailed market data for each coin.  See documentation for the full data structure.
    * TypeScript Response Type: `CoinMarketData[]` (define `CoinMarketData` interface based on the extensive response structure in the documentation)
    * Edge Cases: Handle pagination and large datasets.

* **`/coins/{id}`** (GET)
    * Description: Get detailed coin data by ID.
    * Path Parameters:
        * `id` (string, required): Coin ID.
    * Parameters:
        * `localization` (boolean): Include localized languages.
        * `tickers` (boolean): Include tickers data.
        * `market_data` (boolean): Include market data.
        * `community_data` (boolean): Include community data.
        * `developer_data` (boolean): Include developer data.
        * `sparkline` (boolean): Include sparkline data.
    * Response: Object with detailed coin information.  See documentation for the extensive data structure.
    * TypeScript Response Type: `CoinData` (define `CoinData` interface based on the very extensive response structure in the documentation)

* **`/coins/{id}/tickers`** (GET)
    * Description: Get coin tickers (trading pairs) by coin ID.
    * Path Parameters:
        * `id` (string, required): Coin ID.
    * Parameters:
        * `exchange_ids` (string): Filter by exchange IDs (comma-separated).
        * `include_exchange_logo` (string): Include exchange logos.
        * `page` (number): Page number.
        * `order` (string): Sort order (e.g., 'volume_desc').
        * `depth` (string): Order book depth.
    * Response: Object containing ticker data, including an array of tickers.
    * TypeScript Response Type:  `CoinTickersData` (define interface based on the response structure which includes pagination information and the array of tickers)
    * Edge Cases: Handle pagination.

* **`/coins/{id}/history`** (GET)
    * Description: Get historical data for a coin on a specific date.
    * Path Parameters:
        * `id` (string, required): Coin ID.
    * Parameters:
        * `date` (string, required): Date in YYYY-MM-DD format.
        * `localization` (string): Set to 'false' to exclude localized languages in response.
    * Response: Object with historical market data for the specified date.
    * TypeScript Response Type: `CoinHistoryData` (define interface based on the response structure)

* **`/coins/{id}/market_chart`** (GET)
    * Description: Get historical market chart data for a coin.
    * Path Parameters:
        * `id` (string, required): Coin ID.
    * Parameters:
        * `vs_currency` (string, required): Target currency.
        * `days` (string, required): Number of days ago (e.g., '1', '7', '14', '30', 'max').
        * `interval` (string): Data interval (e.g., 'daily'). Required if `days` is greater than '90'.
    * Response: Object with price, market cap, and volume data over time.
    * TypeScript Response Type: `CoinMarketChartData` (define interface based on the response structure, which includes arrays of arrays for prices, market caps, and volumes)


* **`/coins/{id}/market_chart/range`** (GET)
    * Description: Get historical market chart data within a specific time range.
    * Path Parameters:
        * `id` (string, required): Coin ID.
    * Parameters:
        * `vs_currency` (string, required): Target currency.
        * `from` (number, required):  UNIX timestamp for the start of the range.
        * `to` (number, required): UNIX timestamp for the end of the range.
    * Response:  Similar to `/coins/{id}/market_chart`.
    * TypeScript Response Type: `CoinMarketChartData`

* **`/coins/{id}/ohlc`** (GET) - Deprecated
    * Description: Get OHLC (Open, High, Low, Close) data for a coin. Deprecated, use `/coins/{id}/ohlc/range` instead.

* **`/coins/{id}/ohlc/range`** (GET) - *Paid Plan*
    * Description: Get OHLC data for a coin within a time range.
    * Path Parameters:
        * `id` (string, required): Coin ID.
    * Parameters:
        * `vs_currency` (string, required): Target currency.
        * `from` (number, required): UNIX timestamp.
        * `to` (number, required): UNIX timestamp.

    * Response: Array of arrays, each inner array representing a time period with [timestamp, open, high, low, close].
    * TypeScript Response Type: `[number, number, number, number, number][]`


* **`/coins/top_gainers_losers`** (GET) - *Paid Plan*
    * Description: Get top 30 gainers and losers.
    * Parameters:
        * `vs_currency` (string): Target currency, default 'usd'.
        * `duration` (string): Time duration (1h, 24h, 7d, 14d, 30d, 200d, 1y), default 24h.
    * Response:  Array of coin objects with gain/loss data.
    * TypeScript Response Type: `CoinGainersLosersData[]` (define interface based on response structure)

* **`/coins/list/new`** (GET) - *Paid Plan*
    * Description: List newly added coins.
    * Parameters: None
    * Response: Array of coin objects with basic information.
    * TypeScript Response Type: `NewCoinData[]` (define interface based on response structure)


* **`/coins/{id}/circulating_supply_chart`** (GET) - *Enterprise Plan*
    * Description: Get historical circulating supply chart data.

* **`/coins/{id}/circulating_supply_chart/range`** (GET) - *Enterprise Plan*
    * Description: Get historical circulating supply chart data within a time range.


* **`/coins/{id}/total_supply_chart`** (GET) - *Enterprise Plan*
    * Description: Get historical total supply chart data.


* **`/coins/{id}/total_supply_chart/range`** (GET) - *Enterprise Plan*
    * Description: Get historical total supply chart data within a time range.


* **`/coins/{id}/contract/{contract_address}`** (GET)
    * Description: Get coin data by contract address.
    * Path Parameters:
        * `id` (string, required): Asset platform ID (e.g., 'ethereum').
        * `contract_address` (string, required): Token contract address.
    * Parameters: Similar to `/coins/{id}`.
    * Response: Similar to `/coins/{id}`.
    * TypeScript Response Type:  `CoinData`

* **`/coins/{id}/contract/{contract_address}/market_chart`** (GET)
    * Description: Get historical market chart data by contract address.

* **`/coins/{id}/contract/{contract_address}/market_chart/range`** (GET)
    * Description: Get historical market chart data within a time range by contract address.

* **`/coins/categories/list`** (GET)
    * Description: List coin categories.
    * Parameters: None
    * Response: Array of objects: `{ category_id: string, name: string }`
    * TypeScript Response Type: `{ category_id: string, name: string }[]`

* **`/coins/categories`** (GET)
    * Description: List coin categories with market data.
    * Parameters: None.
    * Response:  Array of objects with category information and market data.
    * TypeScript Response Type: `CoinCategoryData[]` (define interface based on response structure)



**(Continued in next response due to character limit)**
