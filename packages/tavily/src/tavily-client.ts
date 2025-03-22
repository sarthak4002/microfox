import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  pruneNullOrUndefined,
  throttleKy,
} from '@microfox/core';
import defaultKy, { type KyInstance } from 'ky';
import pThrottle from 'p-throttle';
import { z } from 'zod';

export namespace tavily {
  export const API_BASE_URL = 'https://api.tavily.com';

  // Allow up to 20 requests per minute by default.
  export const throttle = pThrottle({
    limit: 20,
    interval: 60 * 1000,
  });

  export const SearchOptionsSchema = z.object({
    query: z.string().describe('Search query. (required)'),
    topic: z
      .string()
      .optional()
      .describe(
        'The category of the search. ' +
          'This will determine which of our agents willbe used for the search. ' +
          'Currently, only "general" and "news" are supported. ' +
          'Default is "general".',
      ),
    search_depth: z
      .enum(['basic', 'advanced'])
      .optional()
      .describe(
        'The depth of the search. It can be basic or advanced. Default is basic ' +
          'for quick results and advanced for indepth high quality results but ' +
          'longer response time. Advanced calls equals 2 requests.',
      ),
    include_answer: z
      .boolean()
      .optional()
      .describe(
        'Include a synthesized answer in the search results. Default is `false`.',
      ),
    include_images: z
      .boolean()
      .optional()
      .describe(
        'Include a list of query related images in the response. Default is `false`.',
      ),
    include_raw_content: z
      .boolean()
      .optional()
      .describe(
        'Include raw content in the search results. Default is `false`.',
      ),
    max_results: z
      .number()
      .optional()
      .describe(
        'The number of maximum search results to return. Default is `5`.',
      ),
    include_domains: z
      .array(z.string())
      .optional()
      .describe(
        'A list of domains to specifically include in the search results. ' +
          'Default is `undefined`, which includes all domains.',
      ),
    exclude_domains: z
      .array(z.string())
      .optional()
      .describe(
        'A list of domains to specifically exclude from the search results. ' +
          "Default is `undefined`, which doesn't exclude any domains.",
      ),
  });
  export type SearchOptions = z.infer<typeof SearchOptionsSchema>;

  export const SearchResultSchema = z.object({
    url: z.string().describe('The url of the search result.'),
    title: z.string().describe('The title of the search result page.'),
    content: z
      .string()
      .describe(
        'The most query related content from the scraped url. We use proprietary ' +
          'AI and algorithms to extract only the most relevant content from each ' +
          'url, to optimize for context quality and size.',
      ),
    raw_content: z
      .string()
      .optional()
      .describe(
        'The parsed and cleaned HTML of the site. For now includes parsed text only.',
      ),
    score: z.string().describe('The relevance score of the search result.'),
  });
  export type SearchResult = z.infer<typeof SearchResultSchema>;

  export const SearchResponseSchema = z.object({
    query: z.string().describe('The search query.'),
    results: z
      .array(SearchResultSchema)
      .describe('A list of sorted search results ranked by relevancy.'),
    answer: z.string().optional().describe('The answer to your search query.'),
    images: z
      .array(z.string())
      .optional()
      .describe('A list of query related image urls.'),
    follow_up_questions: z
      .array(z.string())
      .optional()
      .describe(
        'A list of suggested research follow up questions related to original query.',
      ),
    response_time: z
      .string()
      .describe('How long it took to generate a response.'),
  });
  export type SearchResponse = z.infer<typeof SearchResponseSchema>;
}

/**
 * Tavily provides a web search API tailored for LLMs.
 *
 * @see https://tavily.com
 */
export class TavilyClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance;
  protected readonly apiKey: string;
  protected readonly apiBaseUrl: string;

  constructor({
    apiKey = getEnv('TAVILY_API_KEY'),
    apiBaseUrl = tavily.API_BASE_URL,
    throttle = true,
    ky = defaultKy,
  }: {
    apiKey?: string;
    apiBaseUrl?: string;
    throttle?: boolean;
    ky?: KyInstance;
  } = {}) {
    assert(
      apiKey,
      'TavilyClient missing required "apiKey" (defaults to "TAVILY_API_KEY")',
    );
    super();

    this.apiKey = apiKey;
    this.apiBaseUrl = apiBaseUrl;

    const throttledKy = throttle ? throttleKy(ky, tavily.throttle) : ky;

    this.ky = throttledKy.extend({
      prefixUrl: this.apiBaseUrl,
    });
  }

  /**
   * Searches the web for pages relevant to the given query and summarizes the results.
   */
  @aiFunction({
    name: 'tavily_web_search',
    description:
      'Searches the web to find the most relevant pages for a given query and summarizes the results. Very useful for finding up-to-date news and information about any topic.',
    inputSchema: z.object({
      query: z
        .string()
        .describe('The query to search for. Accepts any Google search query.'),
      search_depth: z
        .enum(['basic', 'advanced'])
        .optional()
        .describe(
          'How deep of a search to perform. Use "basic" for quick results and "advanced" for slower, in-depth results.',
        ),
      include_answer: z
        .boolean()
        .optional()
        .describe(
          'Whether or not to include an answer summary in the results.',
        ),
      include_images: z
        .boolean()
        .optional()
        .describe('Whether or not to include images in the results.'),
      max_results: z
        .number()
        .int()
        .positive()
        .default(5)
        .optional()
        .describe('Max number of search results to return.'),
      // include_domains: z
      //   .array(z.string())
      //   .optional()
      //   .describe(
      //     'List of domains to specifically include in the search results.'
      //   ),
      // exclude_domains: z
      //   .array(z.string())
      //   .optional()
      //   .describe(
      //     'List of domains to specifically exclude from the search results.'
      //   )
    }),
  })
  async search(queryOrOpts: string | tavily.SearchOptions) {
    const options =
      typeof queryOrOpts === 'string' ? { query: queryOrOpts } : queryOrOpts;

    const res = await this.ky
      .post('search', {
        json: {
          ...options,
          api_key: this.apiKey,
        },
      })
      .json<tavily.SearchResponse>();

    return pruneNullOrUndefined({
      ...res,
      results: res.results?.map(pruneNullOrUndefined),
    });
  }
}
