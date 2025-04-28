import { z } from 'zod';

export interface SitesResource {
  siteUrl: string;
  permissionLevel:
    | 'siteFullUser'
    | 'siteOwner'
    | 'siteRestrictedUser'
    | 'siteUnverifiedUser';
}

export interface SitemapResource {
  path: string;
  lastSubmitted: string;
  isPending: boolean;
  isSitemapsIndex: boolean;
  type:
    | 'atomFeed'
    | 'notSitemap'
    | 'patternSitemap'
    | 'rssFeed'
    | 'sitemap'
    | 'urlList';
  lastDownloaded: string;
  warnings: number;
  errors: number;
  contents: { type: string; submitted: number; indexed: number }[];
}

export interface SearchAnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface IndexStatusInspectionResult {
  sitemap: string[];
  referringUrls: string[];
  verdict: 'VERDICT_UNSPECIFIED' | 'PASS' | 'PARTIAL' | 'FAIL' | 'NEUTRAL';
  coverageState: string;
  robotsTxtState: 'ROBOTS_TXT_STATE_UNSPECIFIED' | 'ALLOWED' | 'DISALLOWED';
  indexingState:
    | 'INDEXING_STATE_UNSPECIFIED'
    | 'INDEXING_ALLOWED'
    | 'BLOCKED_BY_META_TAG'
    | 'BLOCKED_BY_HTTP_HEADER'
    | 'BLOCKED_BY_ROBOTS_TXT';
  lastCrawlTime: string;
  pageFetchState:
    | 'PAGE_FETCH_STATE_UNSPECIFIED'
    | 'SUCCESSFUL'
    | 'SOFT_404'
    | 'BLOCKED_ROBOTS_TXT'
    | 'NOT_FOUND'
    | 'ACCESS_DENIED'
    | 'SERVER_ERROR'
    | 'REDIRECT_ERROR'
    | 'ACCESS_FORBIDDEN'
    | 'BLOCKED_4XX'
    | 'INTERNAL_CRAWL_ERROR'
    | 'INVALID_URL';
  googleCanonical: string;
  userCanonical: string;
  crawledAs: 'CRAWLING_USER_AGENT_UNSPECIFIED' | 'DESKTOP' | 'MOBILE';
}

export interface UrlInspectionResult {
  inspectionResultLink: string;
  indexStatusResult: IndexStatusInspectionResult;
  ampResult: any; // Define this interface based on the full API documentation
  mobileUsabilityResult: any; // Define this interface based on the full API documentation
  richResultsResult: any; // Define this interface based on the full API documentation
}

export interface GoogleSearchConsoleSDKOptions {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken: string;
}

export interface SearchAnalyticsQueryParams {
  startDate: string;
  endDate: string;
  dimensions?: (
    | 'query'
    | 'page'
    | 'country'
    | 'device'
    | 'search-appearance'
  )[];
  type?: 'web' | 'news' | 'image' | 'video' | 'discover' | 'googleNews';
  dimensionFilterGroups?: {
    groupType: 'and' | 'or';
    filters?: {
      dimension: string;
      operator:
        | 'equals'
        | 'notEquals'
        | 'contains'
        | 'notContains'
        | 'includingRegex'
        | 'excludingRegex';
      expression: string;
    }[];
  }[];
  aggregationType?: 'auto' | 'byPage' | 'byProperty' | 'byNewsShowcasePanel';
  rowLimit?: number;
  startRow?: number;
  dataState?: 'all' | 'final' | 'hourly_all';
}

export interface UrlInspectionParams {
  inspectionUrl: string;
  siteUrl: string;
  languageCode?: string;
}
