import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  omit,
} from '@microfox/core';
import defaultKy, { type KyInstance } from 'ky';
import { z } from 'zod';

export namespace serper {
  export const API_BASE_URL = 'https://google.serper.dev';

  export const SearchParamsSchema = z.object({
    q: z.string().describe('search query'),
    autocorrect: z
      .boolean()
      .default(true)
      .optional()
      .describe('Whether to autocorrect typos in search query'),
    gl: z
      .string()
      .default('us')
      .optional()
      .describe('Google country code (geo-location)'),
    hl: z
      .string()
      .default('en')
      .optional()
      .describe('Language code for search results'),
    page: z
      .number()
      .int()
      .positive()
      .default(1)
      .optional()
      .describe('Page number of search results'),
    num: z
      .number()
      .int()
      .positive()
      .default(10)
      .optional()
      .describe('number of results to return'),
  });
  export type SearchParams = z.infer<typeof SearchParamsSchema>;

  export const GeneralSearchSchema = SearchParamsSchema.extend({
    type: z
      .enum(['search', 'images', 'videos', 'places', 'news', 'shopping'])
      .default('search')
      .optional()
      .describe('Type of Google search to perform'),
  });
  export type GeneralSearchParams = z.infer<typeof GeneralSearchSchema>;

  export const siteLinkSchema = z.object({
    title: z.string().describe('Title of the site link'),
    link: z.string().describe('URL of the site link'),
  });
  export type SiteLink = z.infer<typeof siteLinkSchema>;

  export const organicSchema = z.object({
    title: z.string().describe('Title of the search result'),
    link: z.string().describe('URL of the search result'),
    snippet: z.string().describe('Text snippet from the search result'),
    position: z.number().describe('Position in search results'),
    imageUrl: z
      .string()
      .optional()
      .describe('URL to an image associated with the result'),
    sitelinks: z
      .array(siteLinkSchema)
      .optional()
      .describe('Additional links from the same site'),
  });
  export type Organic = z.infer<typeof organicSchema>;

  export const answerBoxSchema = z.object({
    snippet: z.string().describe('Main text snippet from the answer box'),
    snippetHighlighted: z
      .array(z.string())
      .optional()
      .describe('Highlighted portions of the snippet'),
    title: z.string().describe('Title of the answer box'),
    link: z.string().describe('URL of the source for the answer box'),
    date: z
      .string()
      .optional()
      .describe('Date associated with the answer box content'),
    position: z.number().optional().describe('Position in search results'),
  });
  export type AnswerBox = z.infer<typeof answerBoxSchema>;

  export const knowledgeGraphSchema = z.object({
    title: z.string().describe('Title of the knowledge graph entity'),
    type: z.string().describe('Type of the entity (e.g., Person, Company)'),
    website: z.string().describe('Website of the entity'),
    imageUrl: z.string().describe('URL to an image of the entity'),
    description: z.string().describe('Description of the entity'),
    descriptionSource: z.string().describe('Source of the description'),
    descriptionLink: z.string().describe('Link to the description source'),
    attributes: z
      .record(z.string())
      .describe('Various attributes of the entity'),
  });
  export type KnowledgeGraph = z.infer<typeof knowledgeGraphSchema>;

  export const peopleAlsoAskSchema = z.object({
    question: z.string().describe('Related question'),
    snippet: z.string().describe('Snippet answer to the question'),
    title: z.string().describe('Title of the source for the answer'),
    link: z.string().describe('URL of the source for the answer'),
  });
  export type PeopleAlsoAsk = z.infer<typeof peopleAlsoAskSchema>;

  export const relatedSearchSchema = z.object({
    query: z.string().describe('Related search query'),
  });
  export type RelatedSearch = z.infer<typeof relatedSearchSchema>;

  export const searchParametersSchema = z.object({
    q: z.string().describe('Search query used'),
    gl: z.string().describe('Google country code used'),
    hl: z.string().describe('Language code used'),
    num: z.number().describe('Number of results requested'),
    autocorrect: z.boolean().describe('Whether autocorrect was enabled'),
    page: z.number().describe('Page number of results'),
    type: z.string().describe('Type of search performed'),
    engine: z.string().describe('Search engine used'),
  });
  export type SearchParameters = z.infer<typeof searchParametersSchema>;

  export const topStorySchema = z.object({
    title: z.string().describe('Title of the news story'),
    link: z.string().describe('URL of the news story'),
    source: z.string().describe('Source of the news story'),
    date: z.string().describe('Date the story was published'),
    imageUrl: z.string().describe('URL to an image for the story'),
  });
  export type TopStory = z.infer<typeof topStorySchema>;

  export const imageSchema = z.object({
    title: z.string().describe('Title of the image'),
    imageUrl: z.string().describe('URL to the full image'),
    imageWidth: z.number().describe('Width of the full image in pixels'),
    imageHeight: z.number().describe('Height of the full image in pixels'),
    thumbnailUrl: z.string().describe('URL to the thumbnail image'),
    thumbnailWidth: z.number().describe('Width of the thumbnail in pixels'),
    thumbnailHeight: z.number().describe('Height of the thumbnail in pixels'),
    source: z.string().describe('Source of the image'),
    domain: z.string().describe('Domain where the image is hosted'),
    link: z.string().describe('URL to the page containing the image'),
    googleUrl: z.string().describe('Google URL for the image'),
    position: z.number().describe('Position in search results'),
  });
  export type Image = z.infer<typeof imageSchema>;

  export const videoSchema = z.object({
    title: z.string().describe('Title of the video'),
    link: z.string().describe('URL to the video'),
    snippet: z.string().describe('Text snippet describing the video'),
    date: z.string().describe('Date the video was published'),
    imageUrl: z.string().describe('URL to a thumbnail image of the video'),
    position: z.number().describe('Position in search results'),
  });
  export type Video = z.infer<typeof videoSchema>;

  export const placeSchema = z.object({
    position: z.number().describe('Position in search results'),
    title: z.string().describe('Name of the place'),
    address: z.string().describe('Address of the place'),
    latitude: z.number().describe('Latitude coordinate'),
    longitude: z.number().describe('Longitude coordinate'),
    category: z.string().describe('Category of the place (e.g., Restaurant)'),
    phoneNumber: z.string().optional().describe('Contact phone number'),
    website: z.string().describe('Website of the place'),
    cid: z.string().describe('Google Maps CID identifier'),
    rating: z.number().optional().describe('Average rating of the place'),
    ratingCount: z.number().optional().describe('Number of ratings'),
  });
  export type Place = z.infer<typeof placeSchema>;

  export const newsSchema = z.object({
    title: z.string().describe('Title of the news article'),
    link: z.string().describe('URL to the news article'),
    snippet: z.string().describe('Text snippet from the article'),
    date: z.string().describe('Date the article was published'),
    source: z.string().describe('Source of the article'),
    imageUrl: z.string().describe('URL to an image for the article'),
    position: z.number().describe('Position in search results'),
  });
  export type News = z.infer<typeof newsSchema>;

  export const shoppingSchema = z.object({
    title: z.string().describe('Title of the product'),
    source: z.string().describe('Source/seller of the product'),
    link: z.string().describe('URL to the product page'),
    price: z.string().describe('Price of the product'),
    imageUrl: z.string().describe('URL to an image of the product'),
    delivery: z.record(z.string()).optional().describe('Delivery information'),
    rating: z.number().optional().describe('Average rating of the product'),
    ratingCount: z.number().optional().describe('Number of ratings'),
    offers: z.string().optional().describe('Special offers information'),
    productId: z.string().optional().describe('Product identifier'),
    position: z.number().describe('Position in search results'),
  });
  export type Shopping = z.infer<typeof shoppingSchema>;

  export const searchResponseSchema = z.object({
    searchParameters: searchParametersSchema
      .extend({ type: z.literal('search') })
      .describe('Parameters used for the search'),
    organic: z.array(organicSchema).describe('Organic search results'),
    answerBox: answerBoxSchema
      .optional()
      .describe('Featured snippet/answer box'),
    knowledgeGraph: knowledgeGraphSchema
      .optional()
      .describe('Knowledge graph information'),
    topStories: z.array(topStorySchema).optional().describe('Top news stories'),
    peopleAlsoAsk: z
      .array(peopleAlsoAskSchema)
      .optional()
      .describe('Related questions people also ask'),
    relatedSearches: z
      .array(relatedSearchSchema)
      .optional()
      .describe('Related search queries'),
  });
  export type SearchResponse = z.infer<typeof searchResponseSchema>;

  export const searchImagesResponseSchema = z.object({
    searchParameters: searchParametersSchema
      .extend({ type: z.literal('images') })
      .describe('Parameters used for the image search'),
    images: z.array(imageSchema).describe('Image search results'),
  });
  export type SearchImagesResponse = z.infer<typeof searchImagesResponseSchema>;

  export const searchVideosResponseSchema = z.object({
    searchParameters: searchParametersSchema
      .extend({ type: z.literal('videos') })
      .describe('Parameters used for the video search'),
    videos: z.array(videoSchema).describe('Video search results'),
  });
  export type SearchVideosResponse = z.infer<typeof searchVideosResponseSchema>;

  export const searchPlacesResponseSchema = z.object({
    searchParameters: searchParametersSchema
      .extend({ type: z.literal('places') })
      .describe('Parameters used for the places search'),
    places: z.array(placeSchema).describe('Place search results'),
  });
  export type SearchPlacesResponse = z.infer<typeof searchPlacesResponseSchema>;

  export const searchNewsResponseSchema = z.object({
    searchParameters: searchParametersSchema
      .extend({ type: z.literal('news') })
      .describe('Parameters used for the news search'),
    news: z.array(newsSchema).describe('News search results'),
  });
  export type SearchNewsResponse = z.infer<typeof searchNewsResponseSchema>;

  export const searchShoppingResponseSchema = z.object({
    searchParameters: searchParametersSchema
      .extend({ type: z.literal('shopping') })
      .describe('Parameters used for the shopping search'),
    shopping: z.array(shoppingSchema).describe('Shopping search results'),
  });
  export type SearchShoppingResponse = z.infer<
    typeof searchShoppingResponseSchema
  >;

  export const responseSchema = z
    .union([
      searchResponseSchema,
      searchImagesResponseSchema,
      searchVideosResponseSchema,
      searchPlacesResponseSchema,
      searchNewsResponseSchema,
      searchShoppingResponseSchema,
    ])
    .describe('Combined response from any type of search');
  export type Response = z.infer<typeof responseSchema>;

  export type ClientParams = Partial<Omit<SearchParams, 'q'>>;
}

/**
 * Lightweight wrapper around Serper for Google search.
 *
 * @see https://serper.dev
 */
export class SerperClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance;
  protected readonly apiKey: string;
  protected readonly apiBaseUrl: string;
  protected readonly params: serper.ClientParams;

  constructor({
    apiKey = getEnv('SERPER_API_KEY'),
    apiBaseUrl = serper.API_BASE_URL,
    ky = defaultKy,
    ...params
  }: {
    apiKey?: string;
    apiBaseUrl?: string;
    ky?: KyInstance;
  } & serper.ClientParams = {}) {
    assert(
      apiKey,
      'SerperClient missing required "apiKey" (defaults to "SERPER_API_KEY")',
    );

    super();

    this.apiKey = apiKey;
    this.apiBaseUrl = apiBaseUrl;
    this.params = params;

    this.ky = ky.extend({
      prefixUrl: this.apiBaseUrl,
      headers: {
        'x-api-key': this.apiKey,
      },
    });
  }

  /**
   * Uses Google Search to return the most relevant web pages for a given query. Useful for finding up-to-date news and information about any topic.
   */
  @aiFunction({
    name: 'serper_google_search',
    description:
      'Uses Google Search to return the most relevant web pages for a given query. Useful for finding up-to-date news and information about any topic.',
    inputSchema: serper.GeneralSearchSchema.pick({
      q: true,
      num: true,
      type: true,
    }),
  })
  async search(queryOrOpts: string | serper.GeneralSearchParams) {
    const searchType =
      typeof queryOrOpts === 'string' ? 'search' : queryOrOpts.type || 'search';
    return this._fetch<serper.SearchResponse>(
      searchType,
      typeof queryOrOpts === 'string' ? queryOrOpts : omit(queryOrOpts, 'type'),
    );
  }

  async searchImages(queryOrOpts: string | serper.SearchParams) {
    return this._fetch<serper.SearchImagesResponse>('images', queryOrOpts);
  }

  async searchVideos(queryOrOpts: string | serper.SearchParams) {
    return this._fetch<serper.SearchVideosResponse>('videos', queryOrOpts);
  }

  async searchPlaces(queryOrOpts: string | serper.SearchParams) {
    return this._fetch<serper.SearchPlacesResponse>('places', queryOrOpts);
  }

  async searchNews(queryOrOpts: string | serper.SearchParams) {
    return this._fetch<serper.SearchNewsResponse>('news', queryOrOpts);
  }

  async searchProducts(queryOrOpts: string | serper.SearchParams) {
    return this._fetch<serper.SearchShoppingResponse>('shopping', queryOrOpts);
  }

  protected async _fetch<T extends serper.Response>(
    endpoint: string,
    queryOrOpts: string | serper.SearchParams,
  ): Promise<T> {
    const params = {
      ...this.params,
      ...(typeof queryOrOpts === 'string' ? { q: queryOrOpts } : queryOrOpts),
    };

    return this.ky.post(endpoint, { json: params }).json<T>();
  }
}
