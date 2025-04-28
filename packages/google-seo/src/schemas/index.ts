import { z } from 'zod';

export const sitesResourceSchema = z.object({
  siteUrl: z.string().url(),
  permissionLevel: z.enum([
    'siteFullUser',
    'siteOwner',
    'siteRestrictedUser',
    'siteUnverifiedUser',
  ]),
});

export const sitemapResourceSchema = z.object({
  path: z.string(),
  lastSubmitted: z.string(),
  isPending: z.boolean(),
  isSitemapsIndex: z.boolean(),
  type: z.enum([
    'atomFeed',
    'notSitemap',
    'patternSitemap',
    'rssFeed',
    'sitemap',
    'urlList',
  ]),
  lastDownloaded: z.string(),
  warnings: z.number(),
  errors: z.number(),
  contents: z.array(
    z.object({
      type: z.string(),
      submitted: z.number(),
      indexed: z.number(),
    }),
  ),
});

export const searchAnalyticsRowSchema = z.object({
  keys: z.array(z.string()),
  clicks: z.number(),
  impressions: z.number(),
  ctr: z.number(),
  position: z.number(),
});

export const indexStatusInspectionResultSchema = z.object({
  sitemap: z.array(z.string()),
  referringUrls: z.array(z.string()),
  verdict: z.enum([
    'VERDICT_UNSPECIFIED',
    'PASS',
    'PARTIAL',
    'FAIL',
    'NEUTRAL',
  ]),
  coverageState: z.string(),
  robotsTxtState: z.enum([
    'ROBOTS_TXT_STATE_UNSPECIFIED',
    'ALLOWED',
    'DISALLOWED',
  ]),
  indexingState: z.enum([
    'INDEXING_STATE_UNSPECIFIED',
    'INDEXING_ALLOWED',
    'BLOCKED_BY_META_TAG',
    'BLOCKED_BY_HTTP_HEADER',
    'BLOCKED_BY_ROBOTS_TXT',
  ]),
  lastCrawlTime: z.string(),
  pageFetchState: z.enum([
    'PAGE_FETCH_STATE_UNSPECIFIED',
    'SUCCESSFUL',
    'SOFT_404',
    'BLOCKED_ROBOTS_TXT',
    'NOT_FOUND',
    'ACCESS_DENIED',
    'SERVER_ERROR',
    'REDIRECT_ERROR',
    'ACCESS_FORBIDDEN',
    'BLOCKED_4XX',
    'INTERNAL_CRAWL_ERROR',
    'INVALID_URL',
  ]),
  googleCanonical: z.string(),
  userCanonical: z.string(),
  crawledAs: z.enum(['CRAWLING_USER_AGENT_UNSPECIFIED', 'DESKTOP', 'MOBILE']),
});

export const urlInspectionResultSchema = z.object({
  inspectionResultLink: z.string(),
  indexStatusResult: indexStatusInspectionResultSchema,
  ampResult: z.any(), // Define this schema based on the full API documentation
  mobileUsabilityResult: z.any(), // Define this schema based on the full API documentation
  richResultsResult: z.any(), // Define this schema based on the full API documentation
});

export const googleSearchConsoleSDKOptionsSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string().url(),
  accessToken: z.string(),
});

export const searchAnalyticsQueryParamsSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  dimensions: z
    .array(z.enum(['query', 'page', 'country', 'device', 'search-appearance']))
    .optional(),
  type: z
    .enum(['web', 'news', 'image', 'video', 'discover', 'googleNews'])
    .optional(),
  dimensionFilterGroups: z
    .array(
      z.object({
        groupType: z.enum(['and', 'or']),
        filters: z
          .array(
            z.object({
              dimension: z.string(),
              operator: z.enum([
                'equals',
                'notEquals',
                'contains',
                'notContains',
                'includingRegex',
                'excludingRegex',
              ]),
              expression: z.string(),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
  aggregationType: z
    .enum(['auto', 'byPage', 'byProperty', 'byNewsShowcasePanel'])
    .optional(),
  rowLimit: z.number().int().positive().max(25000).optional(),
  startRow: z.number().int().nonnegative().optional(),
  dataState: z.enum(['all', 'final', 'hourly_all']).optional(),
});

export const urlInspectionParamsSchema = z.object({
  inspectionUrl: z.string().url(),
  siteUrl: z.string().url(),
  languageCode: z.string().optional(),
});
