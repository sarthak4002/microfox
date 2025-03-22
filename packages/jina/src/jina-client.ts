import {
  aiFunction,
  AIFunctionsProvider,
  getEnv,
  pruneNullOrUndefined,
  throttleKy,
} from '@microfox/core';
import defaultKy, { type KyInstance } from 'ky';
import pThrottle from 'p-throttle';
import { z } from 'zod';

export namespace jina {
  export const ReaderFormatSchema = z.enum([
    'text',
    'html',
    'markdown',
    'screenshot',
  ]);
  export type ReaderFormat = z.infer<typeof ReaderFormatSchema>;

  export const ReaderOptionsSchema = z.object({
    url: z.string().describe('URL to read'),
    timeout: z.number().optional().describe('Optional timeout in seconds'),
    targetSelector: z
      .string()
      .optional()
      .describe(
        "Optional CSS selector to focus on a more specific part of the page. Useful when your desired content doesn't show under the default settings.",
      ),
    waitForSelector: z
      .string()
      .optional()
      .describe(
        "Optional CSS selector to wait for before returning. Useful when your desired content doesn't show under the default settings.",
      ),
    withGeneratedAlt: z.boolean().optional(),
    withLinksSummary: z.boolean().optional(),
    withImagesSummary: z.boolean().optional(),
    setCookie: z.string().optional(),
    proxyUrl: z.string().optional(),
    noCache: z.boolean().optional(),
    returnFormat: ReaderFormatSchema.optional(),
    json: z.boolean().optional(),
  });
  export type ReaderOptions = z.infer<typeof ReaderOptionsSchema>;

  export const SearchOptionsSchema = z.object({
    query: z.string().describe('Search query'),
    site: z
      .string()
      .optional()
      .describe(
        'Returns the search results only from the specified website or domain. By default it searches the entire web.',
      ),
    withGeneratedAlt: z.boolean().optional(),
    withLinksSummary: z.boolean().optional(),
    withImagesSummary: z.boolean().optional(),
    withFavicon: z.boolean().optional(),
    setCookie: z.string().optional(),
    proxyUrl: z.string().optional(),
    noCache: z.boolean().optional(),
    returnFormat: ReaderFormatSchema.exclude(['screenshot']).optional(),
    json: z.boolean().optional(),
  });
  export type SearchOptions = z.infer<typeof SearchOptionsSchema>;

  export const ReaderDataSchema = z.object({
    url: z.string().describe('The URL of the content'),
    title: z.string().describe('The title of the content'),
    content: z.string().describe('The extracted content'),
    description: z
      .string()
      .optional()
      .describe('Brief description of the content'),
    publishedTime: z
      .string()
      .optional()
      .describe('When the content was published'),
    favicon: z.string().optional().describe('URL to the website favicon'),
  });
  export type ReaderData = z.infer<typeof ReaderDataSchema>;

  export const JinaResponseSchema = z.object({
    code: z.number().describe('Response code'),
    status: z.number().describe('HTTP status code'),
    data: z.unknown().describe('Response data'),
  });
  export type JinaResponse = z.infer<typeof JinaResponseSchema>;

  export const ReaderResponseSchema = JinaResponseSchema.extend({
    data: ReaderDataSchema,
  });
  export type ReaderResponse = z.infer<typeof ReaderResponseSchema>;

  export const ReaderResponseScreenshotSchema = JinaResponseSchema.extend({
    data: z.object({
      screenshotUrl: z.string().describe('URL to the screenshot image'),
    }),
  });
  export type ReaderResponseScreenshot = z.infer<
    typeof ReaderResponseScreenshotSchema
  >;

  export const ReaderResponseHtmlSchema = JinaResponseSchema.extend({
    data: z.object({
      html: z.string().describe('HTML content of the page'),
    }),
  });
  export type ReaderResponseHtml = z.infer<typeof ReaderResponseHtmlSchema>;

  export const SearchResponseSchema = JinaResponseSchema.extend({
    data: z.array(ReaderDataSchema),
  });
  export type SearchResponse = z.infer<typeof SearchResponseSchema>;
}

/**
 * LLM-friendly URL reader and search client by Jina AI.
 *
 * - Includes a small free tier.
 * - Does not support "stream mode".
 * - Results default to markdown text format.
 * - To return JSON (especially useful for `search`), set `json: true` in the
 *   options.
 *
 * @see https://jina.ai/reader
 */
export class JinaClient extends AIFunctionsProvider {
  protected readonly kyReader: KyInstance;
  protected readonly kySearch: KyInstance;
  protected readonly apiKey?: string;

  constructor({
    apiKey = getEnv('JINA_API_KEY'),
    timeoutMs = 60_000,
    throttle = true,
    ky = defaultKy,
  }: {
    apiKey?: string;
    timeoutMs?: number;
    throttle?: boolean;
    ky?: KyInstance;
  } = {}) {
    super();

    this.apiKey = apiKey;

    if (apiKey) {
      ky = ky.extend({ headers: { Authorization: `Bearer ${apiKey}` } });
    }

    ky = ky.extend({ timeout: timeoutMs });

    const throttledKyReader = throttle
      ? throttleKy(
          ky,
          pThrottle({
            limit: apiKey ? 200 : 20,
            interval: 60 * 60 * 1000, // 60 minutes
          }),
        )
      : ky;
    this.kyReader = throttledKyReader.extend({
      prefixUrl: 'https://r.jina.ai',
    });

    const throttledKySearch = throttle
      ? throttleKy(
          ky,
          pThrottle({
            limit: apiKey ? 40 : 5,
            interval: 60 * 60 * 1000, // 60 minutes
          }),
        )
      : ky;
    this.kySearch = throttledKySearch.extend({
      prefixUrl: 'https://s.jina.ai',
    });
  }

  /**
   * Reads the contents of the given URL and returns it's main contents in a clean, LLM-friendly format.
   */
  @aiFunction({
    name: 'readUrl',
    description:
      "Reads the contents of the given URL and returns it's main contents in a clean, LLM-friendly format.",
    inputSchema: jina.ReaderOptionsSchema,
  })
  async readUrl<T extends string | jina.ReaderOptions>(
    urlOrOptions: T,
  ): Promise<
    T extends string
      ? string
      : T extends jina.ReaderOptions
        ? T['json'] extends true
          ? T['returnFormat'] extends 'screenshot'
            ? jina.ReaderResponseScreenshot
            : T['returnFormat'] extends 'html'
              ? jina.ReaderResponseHtml
              : jina.ReaderResponse
          : T['returnFormat'] extends 'screenshot'
            ? ArrayBuffer
            : string
        : never
  > {
    const { url, ...opts } =
      typeof urlOrOptions === 'string'
        ? { url: urlOrOptions }
        : jina.ReaderOptionsSchema.parse(pruneNullOrUndefined(urlOrOptions));
    const headers = this._getHeadersFromOptions(opts);

    const res = this.kyReader.get(url, { headers });

    if (opts.json) {
      return res.json<jina.ReaderResponse>() as any;
    } else if (opts.returnFormat === 'screenshot') {
      return res.arrayBuffer() as any;
    } else {
      return res.text() as any;
    }
  }

  /**
   * Searches the web for the given query and returns the top-5 results including their page contents in a clean, LLM-friendly format.
   */
  @aiFunction({
    name: 'search',
    description:
      'Searches the web for the given query and returns the top-5 results including their page contents in a clean, LLM-friendly format.',
    inputSchema: jina.SearchOptionsSchema,
  })
  async search<T extends string | jina.SearchOptions>(
    queryOrOptions: T,
  ): Promise<
    T extends string
      ? string
      : T extends jina.SearchOptions
        ? T['json'] extends true
          ? jina.SearchResponse
          : string
        : never
  > {
    const { query, ...opts } =
      typeof queryOrOptions === 'string'
        ? { query: queryOrOptions }
        : jina.SearchOptionsSchema.parse(pruneNullOrUndefined(queryOrOptions));
    const headers = this._getHeadersFromOptions(opts);

    const res = this.kySearch.get(query, { headers });

    if (opts.json) {
      return res.json<jina.SearchResponse>() as any;
    } else {
      return res.text() as any;
    }
  }

  protected _getHeadersFromOptions(
    options: Record<string, string | boolean | number>,
  ) {
    const { json, ...rest } = options;

    const headerMap: Record<string, string> = {
      site: 'site',
      timeout: 'x-timeout',
      targetSelector: 'x-target-selector',
      waitForSelector: 'x-wait-for-selector',
      withGeneratedAlt: 'x-with-generated-alt',
      withLinksSummary: 'x-with-links-summary',
      withImagesSummary: 'x-with-images-summary',
      withFavicon: 'x-with-favicon',
      setCookie: 'x-set-cookie',
      proxyUrl: 'x-proxy-url',
      noCache: 'x-no-cache',
      returnFormat: 'x-return-format',
    };

    const headers = Object.fromEntries(
      Object.entries(rest).map(([key, value]) => [
        headerMap[key as string]!,
        String(value),
      ]),
    );

    if (json) {
      headers.accept = 'application/json';
    } else if (options.returnFormat !== 'screenshot') {
      headers.accept = 'text/plain';
    }

    return headers;
  }
}
