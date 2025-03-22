import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  omit,
  throttleKy,
} from '@microfox/core';
import defaultKy, { type KyInstance } from 'ky';
import pThrottle from 'p-throttle';
import { z } from 'zod';

export namespace scraper {
  // Allow up to 1 request per second by default.
  export const throttle = pThrottle({
    limit: 1,
    interval: 1000,
    strict: true,
  });

  export const ScrapeResultSchema = z.object({
    title: z.string().optional().describe('The title of the web page'),
    siteName: z.string().optional().describe('The name of the website'),
    description: z
      .string()
      .optional()
      .describe('The meta description of the web page'),
    author: z.string().optional().describe('The author of the content'),
    byline: z.string().optional().describe('The byline of the content'),
    imageUrl: z
      .string()
      .optional()
      .describe('URL of the main image on the page'),
    logoUrl: z.string().optional().describe('URL of the website logo'),
    lang: z.string().optional().describe('The language of the content'),
    length: z
      .number()
      .optional()
      .describe('The length of the content in characters'),
    publishedTime: z
      .string()
      .optional()
      .describe('When the content was published'),
    content: z
      .string()
      .optional()
      .describe('The HTML for the main content of the page'),
    rawHtml: z
      .string()
      .optional()
      .describe('The raw HTML response from the server'),
    markdownContent: z
      .string()
      .optional()
      .describe('The text for the main content of the page in markdown format'),
    textContent: z
      .string()
      .optional()
      .describe('The text for the main content of the page'),
  });

  export type ScrapeResult = z.infer<typeof ScrapeResultSchema>;
}

/**
 * This is a single endpoint API for scraping websites. It returns the HTML,
 * markdown, and plaintext for main body content of the page, as well as
 * metadata like title and description.
 *
 * It tries the simplest and fastest methods first, and falls back to slower
 * proxies and JavaScript rendering if needed.
 *
 * @note This service is currently available only via a closed beta.
 */
export class ScraperClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance;
  protected readonly apiBaseUrl: string;

  constructor({
    apiBaseUrl = getEnv('SCRAPER_API_BASE_URL'),
    throttle = true,
    ky = defaultKy,
  }: {
    apiKey?: string;
    apiBaseUrl?: string;
    throttle?: boolean;
    ky?: KyInstance;
  } = {}) {
    assert(
      apiBaseUrl,
      'ScraperClient missing required "apiBaseUrl" (defaults to "SCRAPER_API_BASE_URL")',
    );
    super();

    this.apiBaseUrl = apiBaseUrl;

    const throttledKy = throttle ? throttleKy(ky, scraper.throttle) : ky;
    this.ky = throttledKy.extend({ prefixUrl: this.apiBaseUrl });
  }

  /**
   * Scrapes the content of a single URL.
   */
  @aiFunction({
    name: 'scrape_url',
    description: 'Scrapes the content of a single URL.',
    inputSchema: z.object({
      url: z.string().url().describe('The URL of the web page to scrape'),
      format: z
        .enum(['html', 'markdown', 'plaintext'])
        .default('markdown')
        .optional()
        .describe(
          'Whether to return the content as HTML, markdown, or plaintext.',
        ),
    }),
  })
  async scrapeUrl(
    urlOrOpts:
      | string
      | {
          url: string;
          format?: 'html' | 'markdown' | 'plaintext' | 'all';
          timeoutMs?: number;
        },
  ): Promise<scraper.ScrapeResult> {
    const {
      timeoutMs = 60_000,
      format = 'markdown',
      ...opts
    } = typeof urlOrOpts === 'string' ? { url: urlOrOpts } : urlOrOpts;

    const res = await this.ky
      .post('scrape', {
        json: opts,
        timeout: timeoutMs,
      })
      .json<scraper.ScrapeResult>();

    if (res.length && res.length <= 40) {
      try {
        const message = (JSON.parse(res.textContent as string) as any).message;
        throw new Error(`Failed to scrape URL "${opts.url}": ${message}`);
      } catch {
        throw new Error(`Failed to scrape URL "${opts.url}"`);
      }
    }

    switch (format) {
      case 'html':
        return omit(res, 'markdownContent', 'textContent', 'rawHtml');

      case 'markdown':
        return omit(res, 'textContent', 'rawHtml', 'content');

      case 'plaintext':
        return omit(res, 'markdownContent', 'rawHtml', 'content');

      default:
        return res;
    }
  }
}
