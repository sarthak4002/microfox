import { z } from 'zod';

export const coinGeckoSDKOptionsSchema = z.object({
  apiKey: z.string().optional(),
}).describe('CoinGecko SDK initialization options');

export const simplePriceParamsSchema = z.object({
  vs_currencies: z.string().describe('Comma-separated list of target currencies'),
  ids: z.string().optional().describe('Comma-separated list of coin IDs'),
  names: z.string().optional().describe('Comma-separated list of coin names (URL-encoded spaces)'),
  symbols: z.string().optional().describe('Comma-separated list of coin symbols'),
  include_tokens: z.string().optional().default('top').describe("'all' for all matching symbols"),
  include_market_cap: z.boolean().optional().describe('Include market cap'),
  include_24hr_vol: z.boolean().optional().describe('Include 24hr volume'),
  include_24hr_change: z.boolean().optional().describe('Include 24hr change'),
  include_last_updated_at: z.boolean().optional().describe('Include last updated timestamp'),
  precision: z.string().optional().describe('Decimal places for price'),
});

export const tokenPriceParamsSchema = simplePriceParamsSchema.extend({
  contract_addresses: z.string().describe('Comma-separated list of contract addresses'),
}).omit({ ids: true, names: true, symbols: true });

export const coinListParamsSchema = z.object({
  include_platform: z.boolean().optional().describe('Include platform and contract addresses'),
  status: z.string().optional().default('active').describe("Filter by coin status ('active' or 'inactive')"),
});

export const coinMarketsParamsSchema = z.object({
  vs_currency: z.string().describe('Target currency'),
  ids: z.string().optional().describe('Comma-separated list of coin IDs'),
  names: z.string().optional().describe('Comma-separated list of coin names (URL-encoded spaces)'),
  symbols: z.string().optional().describe('Comma-separated list of coin symbols'),
  include_tokens: z.string().optional().default('top').describe("'all' for all matching symbols"),
  category: z.string().optional().describe('Filter by category'),
  order: z.string().optional().describe('Sort order (e.g., "market_cap_desc")'),
  per_page: z.number().optional().describe('Results per page'),
  page: z.number().optional().describe('Page number'),
  sparkline: z.boolean().optional().describe('Include sparkline data'),
  price_change_percentage: z.string().optional().describe('Comma-separated list of price change percentage timeframes'),
  locale: z.string().optional().describe('Language'),
  precision: z.string().optional().describe('Decimal places'),
});

export const coinParamsSchema = z.object({
  localization: z.boolean().optional().describe('Include localized languages'),
  tickers: z.boolean().optional().describe('Include tickers data'),
  market_data: z.boolean().optional().describe('Include market data'),
  community_data: z.boolean().optional().describe('Include community data'),
  developer_data: z.boolean().optional().describe('Include developer data'),
  sparkline: z.boolean().optional().describe('Include sparkline data'),
});

export const coinTickersParamsSchema = z.object({
  exchange_ids: z.string().optional().describe('Filter by exchange IDs (comma-separated)'),
  include_exchange_logo: z.string().optional().describe('Include exchange logos'),
  page: z.number().optional().describe('Page number'),
  order: z.string().optional().describe('Sort order (e.g., "volume_desc")'),
  depth: z.string().optional().describe('Order book depth'),
});

export const coinHistoryParamsSchema = z.object({
  date: z.string().describe('Date in YYYY-MM-DD format'),
  localization: z.string().optional().describe('Set to "false" to exclude localized languages in response'),
});

export const marketChartParamsSchema = z.object({
  vs_currency: z.string().describe('Target currency'),
  days: z.string().describe('Number of days ago (e.g., "1", "7", "14", "30", "max")'),
  interval: z.string().optional().describe('Data interval (e.g., "daily")'),
});

export const marketChartRangeParamsSchema = z.object({
  vs_currency: z.string().describe('Target currency'),
  from: z.number().describe('UNIX timestamp for the start of the range'),
  to: z.number().describe('UNIX timestamp for the end of the range'),
});

export const ohlcRangeParamsSchema = z.object({
  vs_currency: z.string().describe('Target currency'),
  from: z.number().describe('UNIX timestamp'),
  to: z.number().describe('UNIX timestamp'),
});

export const topGainersLosersParamsSchema = z.object({
  vs_currency: z.string().optional().default('usd').describe('Target currency'),
  duration: z.string().optional().default('24h').describe('Time duration (1h, 24h, 7d, 14d, 30d, 200d, 1y)'),
});
