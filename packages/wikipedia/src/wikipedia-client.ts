import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  throttleKy,
} from '@microfox/core';
import defaultKy, { type KyInstance } from 'ky';
import pThrottle from 'p-throttle';
import { z } from 'zod';

export namespace wikipedia {
  // Allow up to 200 requests per second by default.
  export const throttle = pThrottle({
    limit: 200,
    interval: 1000,
  });

  export const thumbnailSchema = z.object({
    url: z.string().describe('URL of the thumbnail image'),
    width: z.number().describe('Width of the thumbnail in pixels'),
    height: z.number().describe('Height of the thumbnail in pixels'),
    mimetype: z.string().describe('MIME type of the thumbnail image'),
    duration: z.null().describe('Duration of media (null for images)'),
  });
  export type Thumbnail = z.infer<typeof thumbnailSchema>;

  export const pageSchema = z.object({
    id: z.number().describe('Unique identifier of the page'),
    key: z.string().describe('Unique key for the page'),
    title: z.string().describe('Title of the page'),
    matched_title: z
      .null()
      .describe('Title that matched the search query if different from title'),
    excerpt: z.string().describe('Brief excerpt from the page'),
    description: z
      .union([z.string(), z.null()])
      .describe('Short description of the page content'),
    thumbnail: z
      .union([thumbnailSchema, z.null()])
      .describe('Thumbnail image for the page'),
  });
  export type Page = z.infer<typeof pageSchema>;

  export const searchOptionsSchema = z.object({
    query: z.string().describe('Search query to find Wikipedia pages'),
    limit: z
      .number()
      .optional()
      .describe('Maximum number of results to return'),
  });
  export type SearchOptions = z.infer<typeof searchOptionsSchema>;

  export const pageSearchResponseSchema = z.object({
    pages: z
      .array(pageSchema)
      .describe('List of pages matching the search query'),
  });
  export type PageSearchResponse = z.infer<typeof pageSearchResponseSchema>;

  export const namespaceSchema = z.object({
    id: z.number().describe('ID of the namespace'),
    text: z.string().describe('Text representation of the namespace'),
  });

  export const titlesSchema = z.object({
    canonical: z.string().describe('Canonical title of the page'),
    normalized: z.string().describe('Normalized title of the page'),
    display: z.string().describe('Display title of the page'),
  });

  export const thumbnailResponseSchema = z.object({
    source: z.string().describe('Source URL of the thumbnail'),
    width: z.number().describe('Width of the thumbnail in pixels'),
    height: z.number().describe('Height of the thumbnail in pixels'),
  });

  export const urlsSchema = z.object({
    page: z.string().describe('URL to the page'),
    revisions: z.string().describe('URL to page revisions'),
    edit: z.string().describe('URL to edit the page'),
    talk: z.string().describe('URL to the talk page'),
  });

  export const contentUrlsSchema = z.object({
    desktop: urlsSchema.describe('URLs for desktop view'),
    mobile: urlsSchema.describe('URLs for mobile view'),
  });

  export const coordinatesSchema = z.object({
    lat: z.number().describe('Latitude coordinate'),
    lon: z.number().describe('Longitude coordinate'),
  });

  export const pageSummaryOptionsSchema = z.object({
    title: z.string().describe('Title of the Wikipedia page to retrieve'),
    redirect: z.boolean().optional().describe('Whether to follow redirects'),
    acceptLanguage: z
      .string()
      .optional()
      .describe('Language code for localized content'),
  });
  export type PageSummaryOptions = z.infer<typeof pageSummaryOptionsSchema>;

  export const pageSummaryResponseSchema = z.object({
    ns: z.number().optional().describe('Namespace number'),
    index: z.number().optional().describe('Index of the page'),
    type: z.string().describe('Type of the page (e.g., "standard")'),
    title: z.string().describe('Title of the page'),
    displaytitle: z
      .string()
      .describe('Display title of the page, which may include formatting'),
    namespace: namespaceSchema.describe('Namespace information'),
    wikibase_item: z.string().describe('Wikibase item identifier'),
    titles: titlesSchema.describe('Various title formats'),
    pageid: z.number().describe('Unique identifier of the page'),
    thumbnail: thumbnailResponseSchema.describe('Thumbnail image information'),
    originalimage: thumbnailResponseSchema.describe(
      'Original image information',
    ),
    lang: z.string().describe('Language code of the content'),
    dir: z.string().describe('Text direction (ltr or rtl)'),
    revision: z.string().describe('Revision identifier'),
    tid: z.string().describe('TID of the page'),
    timestamp: z.string().describe('Timestamp of the page version'),
    description: z.string().describe('Short description of the page'),
    description_source: z.string().describe('Source of the description'),
    content_urls: contentUrlsSchema.describe('URLs to various page views'),
    extract: z.string().describe('Plain text extract of the page content'),
    extract_html: z.string().describe('HTML extract of the page content'),
    normalizedtitle: z
      .string()
      .optional()
      .describe('Normalized title if different from the requested title'),
    coordinates: coordinatesSchema
      .optional()
      .describe('Geographic coordinates if applicable'),
  });
  export type PageSummaryResponse = z.infer<typeof pageSummaryResponseSchema>;
}

/**
 * Basic Wikipedia API client for searching wiki pages and resolving page data.
 *
 * @see https://www.mediawiki.org/wiki/API
 */
export class WikipediaClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance;
  protected readonly apiBaseUrl: string;
  protected readonly apiUserAgent: string;

  constructor({
    apiBaseUrl = getEnv('WIKIPEDIA_API_BASE_URL') ??
      'https://en.wikipedia.org/api/rest_v1',
    apiUserAgent = getEnv('WIKIPEDIA_API_USER_AGENT') ??
      'Microfox (https://github.com/microfox-ai/microfox)',
    throttle = true,
    ky = defaultKy,
  }: {
    apiBaseUrl?: string;
    apiUserAgent?: string;
    throttle?: boolean;
    ky?: KyInstance;
  } = {}) {
    assert(apiBaseUrl, 'WikipediaClient missing required "apiBaseUrl"');
    assert(apiUserAgent, 'WikipediaClient missing required "apiUserAgent"');
    super();

    this.apiBaseUrl = apiBaseUrl;
    this.apiUserAgent = apiUserAgent;

    const throttledKy = throttle ? throttleKy(ky, wikipedia.throttle) : ky;

    this.ky = throttledKy.extend({
      headers: {
        'api-user-agent': apiUserAgent,
      },
    });
  }

  /**
   * Searches Wikipedia for pages matching the given query. */
  @aiFunction({
    name: 'wikipedia_search',
    description: 'Searches Wikipedia for pages matching the given query.',
    inputSchema: wikipedia.searchOptionsSchema.pick({ query: true }),
  })
  async search({ query, ...opts }: wikipedia.SearchOptions) {
    return (
      // https://www.mediawiki.org/wiki/API:REST_API
      this.ky
        .get('https://en.wikipedia.org/w/rest.php/v1/search/page', {
          searchParams: { q: query, ...opts },
        })
        .json<wikipedia.PageSearchResponse>()
    );
  }

  /**
   * Gets a summary of the given Wikipedia page.
   */
  @aiFunction({
    name: 'wikipedia_get_page_summary',
    description: 'Gets a summary of the given Wikipedia page.',
    inputSchema: z.object({
      title: z.string().describe('Wikipedia page title'),
      acceptLanguage: z
        .string()
        .optional()
        .default('en-us')
        .describe('Locale code for the language to use.'),
    }),
  })
  async getPageSummary({
    title,
    acceptLanguage = 'en-us',
    redirect = true,
    ...opts
  }: wikipedia.PageSummaryOptions) {
    title = title.trim().replace(/ /g, '_');

    // https://en.wikipedia.org/api/rest_v1/
    return this.ky
      .get(`page/summary/${title}`, {
        prefixUrl: this.apiBaseUrl,
        searchParams: { redirect, ...opts },
        headers: {
          'accept-language': acceptLanguage,
        },
      })
      .json<wikipedia.PageSummaryResponse>();
  }
}
