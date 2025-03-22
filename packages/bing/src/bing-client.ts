import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  omit,
} from '@microfox/core';
import defaultKy, { type KyInstance } from 'ky';
import { z } from 'zod';

export namespace bing {
  export const API_BASE_URL = 'https://api.bing.microsoft.com';

  // Zod schemas
  export const providerSchema = z.object({
    _type: z.string().describe('Type of the provider'),
    url: z.string().describe('URL of the provider'),
  });
  export type Provider = z.infer<typeof providerSchema>;

  export const thumbnailSchema = z.object({
    height: z.number().describe('Height of the thumbnail in pixels'),
    width: z.number().describe('Width of the thumbnail in pixels'),
  });
  export type Thumbnail = z.infer<typeof thumbnailSchema>;

  export const deepLinkSchema = z.object({
    name: z.string().describe('Name of the link'),
    url: z.string().describe('URL of the link'),
  });
  export type DeepLink = z.infer<typeof deepLinkSchema>;

  export const imageSchema = z.object({
    height: z.number().describe('Height of the image in pixels'),
    hostPageUrl: z.string().describe('URL of the page containing the image'),
    name: z.string().describe('Name of the image'),
    provider: z.array(providerSchema).describe('Providers of the image'),
    sourceHeight: z.number().describe('Original height of the image'),
    sourceWidth: z.number().describe('Original width of the image'),
    thumbnailUrl: z.string().describe('URL to the thumbnail of the image'),
    width: z.number().describe('Width of the image in pixels'),
  });
  export type Image = z.infer<typeof imageSchema>;

  export const entityPresentationInfoSchema = z.object({
    entityScenario: z.string().describe('Scenario where this entity appears'),
    entityTypeHints: z.array(z.string()).describe('Type hints for the entity'),
  });
  export type EntityPresentationInfo = z.infer<
    typeof entityPresentationInfoSchema
  >;

  export const purpleContractualRuleSchema = z.object({
    _type: z.string().describe('Type of the contractual rule'),
    license: deepLinkSchema.optional().describe('License information'),
    licenseNotice: z.string().optional().describe('License notice text'),
    mustBeCloseToContent: z
      .boolean()
      .describe('Whether rule must be displayed close to content'),
    targetPropertyName: z
      .string()
      .describe('Name of the property this rule applies to'),
    text: z.string().optional().describe('Text of the rule'),
    url: z.string().optional().describe('URL related to the rule'),
  });
  export type PurpleContractualRule = z.infer<
    typeof purpleContractualRuleSchema
  >;

  export const fluffyContractualRuleSchema = z.object({
    _type: z.string().describe('Type of the contractual rule'),
    license: deepLinkSchema.describe('License information'),
    licenseNotice: z.string().describe('License notice text'),
    mustBeCloseToContent: z
      .boolean()
      .describe('Whether rule must be displayed close to content'),
    targetPropertyIndex: z.number().describe('Index of the target property'),
    targetPropertyName: z
      .string()
      .describe('Name of the property this rule applies to'),
  });
  export type FluffyContractualRule = z.infer<
    typeof fluffyContractualRuleSchema
  >;

  export const addressSchema = z.object({
    addressCountry: z.string().describe('Country of the address'),
    addressLocality: z.string().describe('Locality/city of the address'),
    addressRegion: z.string().describe('Region/state of the address'),
    neighborhood: z.string().describe('Neighborhood of the address'),
    postalCode: z.string().describe('Postal code of the address'),
  });
  export type Address = z.infer<typeof addressSchema>;

  export const creatorSchema = z.object({
    name: z.string().describe('Name of the creator'),
  });
  export type Creator = z.infer<typeof creatorSchema>;

  export const encodingFormatEnum = z
    .enum(['mp4'])
    .describe('Format of the video encoding');
  export type EncodingFormat = z.infer<typeof encodingFormatEnum>;

  export const entitiesValueSchema = z.object({
    bingId: z.string().describe('Bing ID of the entity'),
    contractualRules: z
      .array(purpleContractualRuleSchema)
      .describe('Contractual rules for the entity'),
    description: z.string().describe('Description of the entity'),
    entityPresentationInfo: entityPresentationInfoSchema.describe(
      'Presentation information for the entity',
    ),
    id: z.string().describe('ID of the entity'),
    image: imageSchema.describe('Image associated with the entity'),
    name: z.string().describe('Name of the entity'),
    webSearchUrl: z.string().describe('URL to search for the entity'),
  });
  export type EntitiesValue = z.infer<typeof entitiesValueSchema>;

  export const entitiesSchema = z.object({
    value: z.array(entitiesValueSchema).describe('List of entity values'),
  });
  export type Entities = z.infer<typeof entitiesSchema>;

  export const imagesValueSchema = z.object({
    contentSize: z.string().describe('Size of the image content'),
    contentUrl: z.string().describe('URL to the image content'),
    encodingFormat: z.string().describe('Format of the image encoding'),
    height: z.number().describe('Height of the image in pixels'),
    hostPageDisplayUrl: z
      .string()
      .describe('Display URL of the page containing the image'),
    hostPageUrl: z.string().describe('URL of the page containing the image'),
    name: z.string().describe('Name of the image'),
    thumbnail: thumbnailSchema.describe('Thumbnail information'),
    thumbnailUrl: z.string().describe('URL to the thumbnail of the image'),
    webSearchUrl: z.string().describe('URL to search for the image'),
    width: z.number().describe('Width of the image in pixels'),
  });
  export type ImagesValue = z.infer<typeof imagesValueSchema>;

  export const imagesSchema = z.object({
    id: z.string().describe('ID of the images result'),
    isFamilyFriendly: z
      .boolean()
      .describe('Whether the images are family friendly'),
    readLink: z.string().describe('Link to read more about the images'),
    value: z.array(imagesValueSchema).describe('List of image values'),
    webSearchUrl: z.string().describe('URL to search for the images'),
  });
  export type Images = z.infer<typeof imagesSchema>;

  export const placesValueSchema = z.object({
    _type: z.string().describe('Type of the place'),
    address: addressSchema.describe('Address of the place'),
    entityPresentationInfo: entityPresentationInfoSchema.describe(
      'Presentation information for the place',
    ),
    id: z.string().describe('ID of the place'),
    name: z.string().describe('Name of the place'),
    telephone: z.string().describe('Telephone number of the place'),
    url: z.string().describe('URL of the place'),
    webSearchUrl: z.string().describe('URL to search for the place'),
  });
  export type PlacesValue = z.infer<typeof placesValueSchema>;

  export const placesSchema = z.object({
    value: z.array(placesValueSchema).describe('List of place values'),
  });
  export type Places = z.infer<typeof placesSchema>;

  export const queryContextSchema = z.object({
    askUserForLocation: z
      .boolean()
      .describe('Whether to ask user for location'),
    originalQuery: z.string().describe('Original query from the user'),
  });
  export type QueryContext = z.infer<typeof queryContextSchema>;

  export const itemValueSchema = z.object({
    id: z.string().describe('ID of the item'),
  });
  export type ItemValue = z.infer<typeof itemValueSchema>;

  export const itemSchema = z.object({
    answerType: z.string().describe('Type of the answer'),
    resultIndex: z.number().optional().describe('Index of the result'),
    value: itemValueSchema.optional().describe('Value of the item'),
  });
  export type Item = z.infer<typeof itemSchema>;

  export const mainlineSchema = z.object({
    items: z.array(itemSchema).describe('List of items in the mainline'),
  });
  export type Mainline = z.infer<typeof mainlineSchema>;

  export const rankingResponseSchema = z.object({
    mainline: mainlineSchema.describe('Mainline ranking information'),
    sidebar: mainlineSchema.describe('Sidebar ranking information'),
  });
  export type RankingResponse = z.infer<typeof rankingResponseSchema>;

  export const relatedSearchesValueSchema = z.object({
    displayText: z.string().describe('Display text for the related search'),
    text: z.string().describe('Text of the related search'),
    webSearchUrl: z.string().describe('URL to search for the related term'),
  });
  export type RelatedSearchesValue = z.infer<typeof relatedSearchesValueSchema>;

  export const relatedSearchesSchema = z.object({
    id: z.string().describe('ID of the related searches'),
    value: z
      .array(relatedSearchesValueSchema)
      .describe('List of related search values'),
  });
  export type RelatedSearches = z.infer<typeof relatedSearchesSchema>;

  export const dialerFlagsSchema = z.object({
    country_name: z.string().describe('Name of the country'),
    country_enabled: z
      .boolean()
      .describe('Whether calling is enabled for this country'),
    high_risk_calling_enabled: z
      .boolean()
      .describe('Whether high risk calling is enabled'),
    potential_high_risk_number: z
      .boolean()
      .describe('Whether this is potentially a high risk number'),
  });
  export type DialerFlags = z.infer<typeof dialerFlagsSchema>;

  export const phoneNumberSchema = z.object({
    raw_number: z.string().describe('Raw phone number'),
    sanitized_number: z.string().describe('Sanitized phone number'),
    type: z.any().describe('Type of phone number'),
    position: z.number().describe('Position of the phone number'),
    status: z.string().describe('Status of the phone number'),
    dnc_status: z.any().describe('Do Not Call status'),
    dnc_other_info: z.any().describe('Other Do Not Call information'),
    dialer_flags: dialerFlagsSchema.optional().describe('Dialer flags'),
  });
  export type PhoneNumber = z.infer<typeof phoneNumberSchema>;

  export const videosValueSchema = z.object({
    allowHttpsEmbed: z.boolean().describe('Whether HTTPS embed is allowed'),
    allowMobileEmbed: z.boolean().describe('Whether mobile embed is allowed'),
    contentUrl: z.string().describe('URL to the video content'),
    creator: creatorSchema.describe('Creator of the video'),
    datePublished: z.date().describe('Date when the video was published'),
    description: z.string().describe('Description of the video'),
    duration: z.string().describe('Duration of the video'),
    embedHtml: z.string().describe('HTML to embed the video'),
    encodingFormat: encodingFormatEnum.describe('Format of the video encoding'),
    height: z.number().describe('Height of the video in pixels'),
    hostPageDisplayUrl: z
      .string()
      .describe('Display URL of the page hosting the video'),
    hostPageUrl: z.string().describe('URL of the page hosting the video'),
    isAccessibleForFree: z
      .boolean()
      .describe('Whether the video is accessible for free'),
    isSuperfresh: z.boolean().describe('Whether the video is superfresh'),
    motionThumbnailUrl: z.string().describe('URL to the motion thumbnail'),
    name: z.string().describe('Name of the video'),
    publisher: z.array(creatorSchema).describe('Publishers of the video'),
    thumbnail: thumbnailSchema.describe('Thumbnail information'),
    thumbnailUrl: z.string().describe('URL to the thumbnail of the video'),
    viewCount: z.number().describe('Number of views for the video'),
    webSearchUrl: z.string().describe('URL to search for the video'),
    width: z.number().describe('Width of the video in pixels'),
  });
  export type VideosValue = z.infer<typeof videosValueSchema>;

  export const videosSchema = z.object({
    id: z.string().describe('ID of the videos result'),
    isFamilyFriendly: z
      .boolean()
      .describe('Whether the videos are family friendly'),
    readLink: z.string().describe('Link to read more about the videos'),
    scenario: z.string().describe('Scenario for the videos'),
    value: z.array(videosValueSchema).describe('List of video values'),
    webSearchUrl: z.string().describe('URL to search for the videos'),
  });
  export type Videos = z.infer<typeof videosSchema>;

  export const webPagesValueSchema = z.object({
    dateLastCrawled: z.date().describe('Date when the page was last crawled'),
    deepLinks: z
      .array(deepLinkSchema)
      .optional()
      .describe('Deep links within the page'),
    displayUrl: z.string().describe('Display URL of the page'),
    id: z.string().describe('ID of the web page'),
    isFamilyFriendly: z
      .boolean()
      .describe('Whether the page is family friendly'),
    isNavigational: z.boolean().describe('Whether the page is navigational'),
    language: z.string().describe('Language of the page'),
    name: z.string().describe('Name of the page'),
    snippet: z.string().describe('Snippet from the page'),
    thumbnailUrl: z
      .string()
      .optional()
      .describe('URL to the thumbnail of the page'),
    url: z.string().describe('URL of the page'),
    contractualRules: z
      .array(fluffyContractualRuleSchema)
      .optional()
      .describe('Contractual rules for the page'),
  });
  export type WebPagesValue = z.infer<typeof webPagesValueSchema>;

  export const webPagesSchema = z.object({
    totalEstimatedMatches: z
      .number()
      .describe('Total estimated matches for the search'),
    value: z.array(webPagesValueSchema).describe('List of web page values'),
    webSearchUrl: z.string().describe('URL to search for the web pages'),
  });
  export type WebPages = z.infer<typeof webPagesSchema>;

  export const searchQuerySchema = z.object({
    q: z.string().describe('Search query string'),
    mkt: z
      .string()
      .optional()
      .describe('Market code for regional results (e.g., en-US)'),
    offset: z.number().optional().describe('Offset for pagination of results'),
    count: z.number().optional().describe('Number of results to return'),
    safeSearch: z
      .enum(['Off', 'Moderate', 'Strict'])
      .optional()
      .describe('Safe search level'),
    textDecorations: z
      .boolean()
      .optional()
      .describe('Whether to apply text decorations'),
    textFormat: z
      .enum(['Raw', 'HTML'])
      .optional()
      .describe('Format of the text'),
  });
  export type SearchQuery = z.infer<typeof searchQuerySchema>;

  export const searchResponseSchema = z.object({
    _type: z.string().describe('Type of the search response'),
    entities: entitiesSchema.describe('Entities found in the search'),
    images: imagesSchema.describe('Images found in the search'),
    places: placesSchema.describe('Places found in the search'),
    queryContext: queryContextSchema.describe('Context of the query'),
    rankingResponse: rankingResponseSchema.describe(
      'Ranking information for the results',
    ),
    relatedSearches: relatedSearchesSchema.describe('Related searches'),
    videos: videosSchema.describe('Videos found in the search'),
    webPages: webPagesSchema.describe('Web pages found in the search'),
  });
  export type SearchResponse = z.infer<typeof searchResponseSchema>;
}

/**
 * Bing web search client.
 *
 * @see https://www.microsoft.com/en-us/bing/apis/bing-web-search-api
 */
export class BingClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance;
  protected readonly apiKey: string;
  protected readonly apiBaseUrl: string;

  constructor({
    apiKey = getEnv('BING_API_KEY'),
    apiBaseUrl = bing.API_BASE_URL,
    ky = defaultKy,
  }: {
    apiKey?: string;
    apiBaseUrl?: string;
    ky?: KyInstance;
  } = {}) {
    assert(
      apiKey,
      'BingClient missing required "apiKey" (defaults to "BING_API_KEY")',
    );
    super();

    this.apiKey = apiKey;
    this.apiBaseUrl = apiBaseUrl;

    this.ky = ky.extend({
      prefixUrl: this.apiBaseUrl,
    });
  }

  /**
   * Searches the web using the Bing search engine to return the most relevant web pages for a given query. Can also be used to find up-to-date news and information about many topics.
   */
  @aiFunction({
    name: 'bing_web_search',
    description:
      'Searches the web using the Bing search engine to return the most relevant web pages for a given query. Can also be used to find up-to-date news and information about many topics.',
    inputSchema: bing.searchQuerySchema,
  })
  async search(queryOrOpts: string | bing.SearchQuery) {
    const defaultQuery: Partial<bing.SearchQuery> = {
      mkt: 'en-US',
    };

    const searchParams =
      typeof queryOrOpts === 'string'
        ? {
            ...defaultQuery,
            q: queryOrOpts,
          }
        : {
            ...defaultQuery,
            ...queryOrOpts,
          };

    // console.log(searchParams)
    const res = await this.ky
      .get('v7.0/search', {
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
        },
        searchParams,
      })
      .json<bing.SearchResponse>();

    return omit(res, 'rankingResponse');
  }
}
