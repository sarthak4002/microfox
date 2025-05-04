import { z } from 'zod';
import {
  CoinGeckoSDKOptions,
  SimplePrice,
  SupportedVsCurrencies,
  CoinList,
  CoinMarkets,
  CoinData,
  CoinTickers,
  CoinHistory,
  CoinMarketChart,
  OHLCData,
  TopGainersLosers,
  NewCoins,
  CoinCategories,
  CoinCategoriesMarketData,
} from './types';
import {
  coinGeckoSDKOptionsSchema,
  simplePriceParamsSchema,
  tokenPriceParamsSchema,
  coinListParamsSchema,
  coinMarketsParamsSchema,
  coinParamsSchema,
  coinTickersParamsSchema,
  coinHistoryParamsSchema,
  marketChartParamsSchema,
  marketChartRangeParamsSchema,
  ohlcRangeParamsSchema,
  topGainersLosersParamsSchema,
} from './schemas';

const BASE_URL = 'https://pro-api.coingecko.com/api/v3';

export class CoinGeckoSDK {
  private apiKey: string;

  constructor(options: CoinGeckoSDKOptions) {
    const validatedOptions = coinGeckoSDKOptionsSchema.parse(options);
    this.apiKey = validatedOptions.apiKey || process.env.COINGECKO_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('API key is required. Please provide it in the constructor or set the COINGECKO_API_KEY environment variable.');
    }
  }

  private async fetchJson<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = new URL(`${BASE_URL}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        'x-cg-pro-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  async ping(): Promise<{ gecko_says: string }> {
    return this.fetchJson('/ping');
  }

  async getApiUsage(): Promise<any> {
    return this.fetchJson('/key');
  }

  async getSimplePrice(params: z.infer<typeof simplePriceParamsSchema>): Promise<SimplePrice> {
    const validatedParams = simplePriceParamsSchema.parse(params);
    return this.fetchJson('/simple/price', validatedParams);
  }

  async getTokenPrice(id: string, params: z.infer<typeof tokenPriceParamsSchema>): Promise<SimplePrice> {
    const validatedParams = tokenPriceParamsSchema.parse(params);
    return this.fetchJson(`/simple/token_price/${id}`, validatedParams);
  }

  async getSupportedVsCurrencies(): Promise<SupportedVsCurrencies> {
    return this.fetchJson('/simple/supported_vs_currencies');
  }

  async getCoinsList(params?: z.infer<typeof coinListParamsSchema>): Promise<CoinList> {
    const validatedParams = coinListParamsSchema.parse(params || {});
    return this.fetchJson('/coins/list', validatedParams);
  }

  async getCoinsMarkets(params: z.infer<typeof coinMarketsParamsSchema>): Promise<CoinMarkets> {
    const validatedParams = coinMarketsParamsSchema.parse(params);
    return this.fetchJson('/coins/markets', validatedParams);
  }

  async getCoinData(id: string, params?: z.infer<typeof coinParamsSchema>): Promise<CoinData> {
    const validatedParams = coinParamsSchema.parse(params || {});
    return this.fetchJson(`/coins/${id}`, validatedParams);
  }

  async getCoinTickers(id: string, params?: z.infer<typeof coinTickersParamsSchema>): Promise<CoinTickers> {
    const validatedParams = coinTickersParamsSchema.parse(params || {});
    return this.fetchJson(`/coins/${id}/tickers`, validatedParams);
  }

  async getCoinHistory(id: string, params: z.infer<typeof coinHistoryParamsSchema>): Promise<CoinHistory> {
    const validatedParams = coinHistoryParamsSchema.parse(params);
    return this.fetchJson(`/coins/${id}/history`, validatedParams);
  }

  async getCoinMarketChart(id: string, params: z.infer<typeof marketChartParamsSchema>): Promise<CoinMarketChart> {
    const validatedParams = marketChartParamsSchema.parse(params);
    return this.fetchJson(`/coins/${id}/market_chart`, validatedParams);
  }

  async getCoinMarketChartRange(id: string, params: z.infer<typeof marketChartRangeParamsSchema>): Promise<CoinMarketChart> {
    const validatedParams = marketChartRangeParamsSchema.parse(params);
    return this.fetchJson(`/coins/${id}/market_chart/range`, validatedParams);
  }

  async getCoinOHLCRange(id: string, params: z.infer<typeof ohlcRangeParamsSchema>): Promise<OHLCData> {
    const validatedParams = ohlcRangeParamsSchema.parse(params);
    return this.fetchJson(`/coins/${id}/ohlc/range`, validatedParams);
  }

  async getTopGainersLosers(params?: z.infer<typeof topGainersLosersParamsSchema>): Promise<TopGainersLosers> {
    const validatedParams = topGainersLosersParamsSchema.parse(params || {});
    return this.fetchJson('/coins/top_gainers_losers', validatedParams);
  }

  async getNewCoins(): Promise<NewCoins> {
    return this.fetchJson('/coins/list/new');
  }

  async getCoinByContractAddress(id: string, contractAddress: string, params?: z.infer<typeof coinParamsSchema>): Promise<CoinData> {
    const validatedParams = coinParamsSchema.parse(params || {});
    return this.fetchJson(`/coins/${id}/contract/${contractAddress}`, validatedParams);
  }

  async getCoinCategoriesList(): Promise<CoinCategories> {
    return this.fetchJson('/coins/categories/list');
  }

  async getCoinCategories(): Promise<CoinCategoriesMarketData> {
    return this.fetchJson('/coins/categories');
  }
}

export function createCoinGeckoSDK(options: CoinGeckoSDKOptions): CoinGeckoSDK {
  return new CoinGeckoSDK(options);
}
