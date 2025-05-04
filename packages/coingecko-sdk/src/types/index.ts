import { z } from 'zod';

export interface CoinGeckoSDKOptions {
  apiKey?: string;
}

export type SimplePrice = Record<string, Record<string, number | null>>;

export type SupportedVsCurrencies = string[];

export interface CoinListItem {
  id: string;
  symbol: string;
  name: string;
  platforms?: Record<string, string>;
}

export type CoinList = CoinListItem[];

export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: {
    times: number;
    currency: string;
    percentage: number;
  } | null;
  last_updated: string;
  sparkline_in_7d?: {
    price: number[];
  };
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
}

export type CoinMarkets = CoinMarketData[];

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  asset_platform_id: string | null;
  platforms: Record<string, string>;
  block_time_in_minutes: number;
  hashing_algorithm: string | null;
  categories: string[];
  public_notice: string | null;
  additional_notices: string[];
  localization: Record<string, string>;
  description: Record<string, string>;
  links: Record<string, any>;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  country_origin: string;
  genesis_date: string | null;
  sentiment_votes_up_percentage: number;
  sentiment_votes_down_percentage: number;
  market_cap_rank: number;
  coingecko_rank: number;
  coingecko_score: number;
  developer_score: number;
  community_score: number;
  liquidity_score: number;
  public_interest_score: number;
  market_data: Record<string, any>;
  community_data: Record<string, any>;
  developer_data: Record<string, any>;
  public_interest_stats: Record<string, any>;
  status_updates: any[];
  last_updated: string;
  tickers: any[];
}

export interface CoinTickers {
  name: string;
  tickers: Array<{
    base: string;
    target: string;
    market: {
      name: string;
      identifier: string;
      has_trading_incentive: boolean;
    };
    last: number;
    volume: number;
    converted_last: Record<string, number>;
    converted_volume: Record<string, number>;
    trust_score: string;
    bid_ask_spread_percentage: number;
    timestamp: string;
    last_traded_at: string;
    last_fetch_at: string;
    is_anomaly: boolean;
    is_stale: boolean;
    trade_url: string | null;
    token_info_url: string | null;
    coin_id: string;
    target_coin_id?: string;
  }>;
}

export interface CoinHistory {
  id: string;
  symbol: string;
  name: string;
  localization: Record<string, string>;
  image: {
    thumb: string;
    small: string;
  };
  market_data: {
    current_price: Record<string, number>;
    market_cap: Record<string, number>;
    total_volume: Record<string, number>;
  };
  community_data: Record<string, number>;
  developer_data: Record<string, number>;
  public_interest_stats: Record<string, number>;
}

export interface CoinMarketChart {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export type OHLCData = [number, number, number, number, number][];

export interface TopGainersLosersItem {
  id: string;
  symbol: string;
  name: string;
  image: string;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  price_change_percentage_14d: number;
  price_change_percentage_30d: number;
  price_change_percentage_60d: number;
  price_change_percentage_200d: number;
  price_change_percentage_1y: number;
  sparkline_in_7d: {
    price: number[];
  };
}

export interface TopGainersLosers {
  top_gainers: TopGainersLosersItem[];
  top_losers: TopGainersLosersItem[];
}

export interface NewCoinItem {
  id: string;
  symbol: string;
  name: string;
  image: string;
  market_cap_rank: number | null;
  is_new: boolean;
}

export type NewCoins = NewCoinItem[];

export interface CoinCategory {
  category_id: string;
  name: string;
}

export type CoinCategories = CoinCategory[];

export interface CoinCategoryMarketData {
  id: string;
  name: string;
  market_cap: number;
  market_cap_change_24h: number;
  content: string;
  top_3_coins: string[];
  volume_24h: number;
  updated_at: string;
}

export type CoinCategoriesMarketData = CoinCategoryMarketData[];
