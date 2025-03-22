import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  omit,
  pick,
  pruneUndefined,
} from '@microfox/core';
import defaultKy, { type KyInstance } from 'ky';
import { z } from 'zod';

export namespace searxng {
  export const SearchCategorySchema = z.enum([
    'general',
    'images',
    'videos',
    'news',
    'map',
    'music',
    'it',
    'science',
    'files',
    'social media',
  ]);

  export const SearchEngineSchema = z.enum([
    '9gag',
    'annas archive',
    'apk mirror',
    'apple app store',
    'ahmia',
    'anaconda',
    'arch linux wiki',
    'artic',
    'arxiv',
    'ask',
    'bandcamp',
    'wikipedia',
    'bilibili',
    'bing',
    'bing images',
    'bing news',
    'bing videos',
    'bitbucket',
    'bpb',
    'btdigg',
    'ccc-tv',
    'openverse',
    'chefkoch',
    'crossref',
    'crowdview',
    'yep',
    'yep images',
    'yep news',
    'curlie',
    'currency',
    'bahnhof',
    'deezer',
    'destatis',
    'deviantart',
    'ddg definitions',
    'docker hub',
    'erowid',
    'wikidata',
    'duckduckgo',
    'duckduckgo images',
    'duckduckgo videos',
    'duckduckgo news',
    'duckduckgo weather',
    'apple maps',
    'emojipedia',
    'tineye',
    'etymonline',
    '1x',
    'fdroid',
    'flickr',
    'free software directory',
    'frinkiac',
    'fyyd',
    'genius',
    'gentoo',
    'gitlab',
    'github',
    'codeberg',
    'goodreads',
    'google',
    'google images',
    'google news',
    'google videos',
    'google scholar',
    'google play apps',
    'google play movies',
    'material icons',
    'gpodder',
    'habrahabr',
    'hackernews',
    'hoogle',
    'imdb',
    'imgur',
    'ina',
    'invidious',
    'jisho',
    'kickass',
    'lemmy communities',
    'lemmy users',
    'lemmy posts',
    'lemmy comments',
    'library genesis',
    'z-library',
    'library of congress',
    'lingva',
    'lobste.rs',
    'mastodon users',
    'mastodon hashtags',
    'mdn',
    'metacpan',
    'mixcloud',
    'mozhi',
    'mwmbl',
    'npm',
    'nyaa',
    'mankier',
    'odysee',
    'openairedatasets',
    'openairepublications',
    'openstreetmap',
    'openrepos',
    'packagist',
    'pdbe',
    'photon',
    'pinterest',
    'piped',
    'piped.music',
    'piratebay',
    'podcastindex',
    'presearch',
    'presearch images',
    'presearch videos',
    'presearch news',
    'pubmed',
    'pypi',
    'qwant',
    'qwant images',
    'qwant news',
    'reddit',
    'reddit images',
    'reddit videos',
    'rumble',
    'rubygems',
    'sciencehuberlin',
    'scryfall',
    'soundcloud',
    'sourceforge',
    'stackoverflow',
    'startpage',
    'startpage images',
    'steam',
    'teddit',
    'teampyqa',
    'tvmaze',
    'technorati',
    'thefreedictionary',
    'threat dragon',
    'tib',
    'bing translator',
    'google translate',
    'deepl',
    'lingva',
    'twitch',
    'twitter',
    'url',
    'wallhaven',
    'wiby',
    'wordnik',
    'wttr',
    'wayback machine',
    'wikibooks',
    'wikinews',
    'wikiquote',
    'wikisource',
    'wiktionary',
    'wisdomdb',
    'wolframalpha',
    'world bank data',
    'yahoo',
    'yahoo news',
    'yahoo images',
    'youku',
    'youtube',
    'zackthebarber',
    'acgsou',
    'yacy',
    'yacy images',
    'ebay',
    'etools',
    'etools images',
    'etools music',
    'etools videos',
    'etools science',
    'etools news',
    'etools map',
    'etools it',
    'etools files',
    'etools social media',
    'etools general',
  ]);

  export type SearchCategory = z.infer<typeof SearchCategorySchema>;
  export type SearchEngine = z.infer<typeof SearchEngineSchema>;

  export const SearchOptionsSchema = z.object({
    query: z.string().describe('search query'),
    categories: z
      .array(SearchCategorySchema)
      .optional()
      .describe(
        'narrows the search to only use search engines in specific categories',
      ),
    engines: z
      .array(SearchEngineSchema)
      .optional()
      .describe('narrows the search to only use specific search engines'),
    language: z.string().optional(),
    pageno: z.number().int().optional(),
  });
  export type SearchOptions = z.infer<typeof SearchOptionsSchema>;

  export const SearchResultSchema = z.object({
    title: z.string().describe('Title of the search result'),
    url: z.string().describe('URL of the search result'),
    img_src: z.string().optional().describe('URL to the full-size image'),
    thumbnail_src: z.string().optional().describe('URL to the thumbnail image'),
    thumbnail: z.string().optional().describe('Legacy thumbnail URL'),
    content: z
      .string()
      .optional()
      .describe('Content snippet from the search result'),
    author: z.string().optional().describe('Author of the content'),
    iframe_src: z.string().optional().describe('URL for iframe embedding'),
    category: SearchCategorySchema.optional().describe(
      'Category of the search result',
    ),
    engine: SearchEngineSchema.optional().describe(
      'Search engine that provided this result',
    ),
    publishedDate: z
      .string()
      .optional()
      .describe('Publication date of the content'),
  });
  export type SearchResult = z.infer<typeof SearchResultSchema>;

  export const SearchResponseSchema = z.object({
    results: z.array(SearchResultSchema).describe('List of search results'),
    suggestions: z.array(z.string()).describe('Suggested search queries'),
    query: z.string().describe('The original search query'),
  });
  export type SearchResponse = z.infer<typeof SearchResponseSchema>;
}

/**
 * Open source meta search engine capable of searching across many different
 * sources and search engines.
 *
 * The most important search engines are:
 *
 * - "reddit" (Reddit posts)
 * - "google" (Google web search)
 * - "google news" (Google News search)
 * - "brave" (Brave web search)
 * - "arxiv" (academic papers)
 * - "genius" (Genius.com for song lyrics)
 * - "imdb" (movies and TV shows)
 * - "hackernews" (Hacker News)
 * - "wikidata" (Wikidata)
 * - "wolframalpha" (Wolfram Alpha)
 * - "youtube" (YouTube videos)
 * - "github" (GitHub code and repositories)
 *
 * @see https://docs.searxng.org
 *
 * NOTE: You'll need to run a local instance of Searxng to use this client.
 *
 * See [perplexica](https://github.com/ItzCrazyKns/Perplexica/blob/master/docker-compose.yaml) for an example of how to set this up.
 */
export class SearxngClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance;
  protected readonly apiBaseUrl: string;

  constructor({
    apiBaseUrl = getEnv('SEARXNG_API_BASE_URL'),
    ky = defaultKy,
  }: {
    apiBaseUrl?: string;
    ky?: KyInstance;
  } = {}) {
    assert(
      apiBaseUrl,
      'SearxngClient missing required "apiBaseUrl" (defaults to "SEARXNG_API_BASE_URL")',
    );
    super();

    this.apiBaseUrl = apiBaseUrl;

    this.ky = ky.extend({ prefixUrl: apiBaseUrl });
  }

  /**
   * Searches across multiple search engines using a local instance of Searxng. To search only specific engines, use the `engines` parameter.
   *
   * The most important search engines are:
   *
   * - "reddit" (Reddit posts)
   * - "google" (Google web search)
   * - "google news" (Google News search)
   * - "brave" (Brave web search)
   * - "arxiv" (academic papers)
   * - "genius" (Genius.com for song lyrics)
   * - "imdb" (movies and TV shows)
   * - "hackernews" (Hacker News)
   * - "wikidata" (Wikidata)
   * - "wolframalpha" (Wolfram Alpha)
   * - "youtube" (YouTube videos)
   */
  @aiFunction({
    name: 'searxng',
    description: `Searches across multiple search engines using a local instance of Searxng. To search only specific engines, use the \`engines\` parameter.

The most important search engines are:

- "reddit" (Reddit posts)
- "google" (Google web search)
- "google news" (Google News search)
- "brave" (Brave web search)
- "arxiv" (academic papers)
- "genius" (Genius.com for song lyrics)
- "imdb" (movies and TV shows)
- "hackernews" (Hacker News)
- "wikidata" (Wikidata)
- "wolframalpha" (Wolfram Alpha)
- "youtube" (YouTube videos)
- "github" (GitHub code and repositories)
`,
    inputSchema: searxng.SearchOptionsSchema,
  })
  async search({
    query,
    ...opts
  }: searxng.SearchOptions): Promise<searxng.SearchResponse> {
    const res = await this.ky
      .get('search', {
        searchParams: pruneUndefined({
          ...opts,
          q: query,
          categories: opts.categories?.join(','),
          engines: opts.engines?.join(','),
          format: 'json',
        }),
      })
      .json<searxng.SearchResponse>();

    res.results = res.results?.map(
      (result: any) =>
        omit(
          result,
          'parsed_url',
          'engines',
          'positions',
          'template',
        ) as searxng.SearchResult,
    );

    return pick(res, 'results', 'suggestions', 'query');
  }
}
