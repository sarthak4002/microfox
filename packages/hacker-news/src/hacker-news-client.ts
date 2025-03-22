import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  sanitizeSearchParams,
  pruneNullOrUndefined,
} from '@microfox/core';
import defaultKy, { type KyInstance } from 'ky';
import z from 'zod';

export namespace hackernews {
  export const HACKER_NEWS_API_BASE_URL = 'https://hacker-news.firebaseio.com';
  export const HACKER_NEWS_API_SEARCH_BASE_URL = 'https://hn.algolia.com';
  export const HACKER_NEWS_API_USER_AGENT =
    'Microfox (https://github.com/microfox-ai/microfox)';

  export const API_BASE_URL = HACKER_NEWS_API_BASE_URL;
  export const SEARCH_API_BASE_URL = HACKER_NEWS_API_SEARCH_BASE_URL;

  export const ItemTypeSchema = z
    .enum(['story', 'comment', 'ask', 'job', 'poll', 'pollopt'])
    .describe('Type of Hacker News item');
  export type ItemType = z.infer<typeof ItemTypeSchema>;

  export const ItemSchema = z.object({
    id: z.number().describe("The item's unique id"),
    type: ItemTypeSchema.describe('The type of item'),
    by: z.string().describe("The username of the item's author"),
    time: z.number().describe('Creation date of the item, in Unix Time'),
    score: z.number().describe("The story's score, or the votes for a comment"),
    title: z
      .string()
      .optional()
      .describe('The title of the story, poll or job'),
    url: z.string().optional().describe('The URL of the story'),
    text: z
      .string()
      .optional()
      .describe('The comment, story or poll text. HTML'),
    descendants: z.number().optional().describe('The total comment count'),
    parent: z
      .number()
      .optional()
      .describe(
        "The comment's parent: either another comment or the relevant story",
      ),
    kids: z
      .array(z.number())
      .optional()
      .describe("The ids of the item's comments, in ranked display order"),
    parts: z
      .array(z.number())
      .optional()
      .describe('A list of related pollopts, in display order'),
  });
  export type Item = z.infer<typeof ItemSchema>;

  export const UserSchema = z.object({
    id: z.string().describe("The user's unique username. Case-sensitive."),
    created: z.number().describe('Creation date of the user, in Unix Time'),
    about: z.string().describe("The user's self-description. HTML"),
    karma: z.number().describe("The user's karma"),
    submitted: z
      .array(z.number())
      .describe("List of the user's stories, polls and comments"),
  });
  export type User = z.infer<typeof UserSchema>;

  export type SearchTag =
    | 'story'
    | 'comment'
    | 'ask_hn'
    | 'show_hn'
    | 'launch_hn'
    | 'poll'
    | 'pollopt'
    | 'front_page';

  export type SearchNumericFilterField =
    | 'created_at_i'
    | 'points'
    | 'num_comments';
  export type SearchNumericFilterCondition = '<' | '<=' | '=' | '>' | '>=';
  export type SearchSortBy =
    | 'search'
    | 'search_by_date'
    | 'created_at_i'
    | 'points'
    | 'num_comments';

  export const SearchOptionsSchema = z.object({
    query: z.string().optional().describe('Full-text search query'),
    author: z.string().optional().describe("Filter by author's HN username"),
    story: z.string().optional().describe('Filter by story id'),
    tags: z
      .array(z.string())
      .optional()
      .describe('Filter by type of item (story, comment, etc.)'),
    numericFilters: z
      .array(z.string())
      .optional()
      .describe(
        'Filter by numeric range (created_at_i, points, or num_comments)',
      ),
    page: z.number().optional().describe('Page number to return'),
    hitsPerPage: z
      .number()
      .optional()
      .describe('Number of results to return per page'),
    sortBy: z.string().optional().describe('How to sort the results'),
  });
  export type SearchOptions = z.infer<typeof SearchOptionsSchema>;

  export interface SearchItem {
    id: number;
    created_at: string;
    created_at_i: number;
    title?: string;
    url?: string;
    author: string;
    text: string | null;
    points: number | null;
    parent_id: number | null;
    story_id: number | null;
    type: ItemType;
    children: SearchItem[];
    options?: any[];
  }

  export const SearchItemSchema: z.ZodType<SearchItem> = z.object({
    id: z.number().describe("The item's unique id"),
    created_at: z
      .string()
      .describe('Creation date of the item, in ISO 8601 format'),
    created_at_i: z
      .number()
      .describe('Creation date of the item, in Unix Time'),
    title: z
      .string()
      .optional()
      .describe('The title of the story, poll or job'),
    url: z.string().optional().describe('The URL of the story'),
    author: z.string().describe("The username of the item's author"),
    text: z
      .string()
      .nullable()
      .describe('The comment, story or poll text. HTML'),
    points: z
      .number()
      .nullable()
      .describe("The story's score, or the votes for a comment"),
    parent_id: z
      .number()
      .nullable()
      .describe(
        "The comment's parent: either another comment or the relevant story",
      ),
    story_id: z
      .number()
      .nullable()
      .describe('The id of the story this comment belongs to'),
    type: ItemTypeSchema.describe('The type of item'),
    children: z
      .array(z.lazy(() => SearchItemSchema))
      .describe('Child comments'),
    options: z.array(z.any()).optional().describe('Options for polls'),
  });

  export const SearchUserSchema = z.object({
    username: z.string().describe("The user's unique username"),
    about: z.string().describe("The user's self-description. HTML"),
    karma: z.number().describe("The user's karma"),
  });
  export type SearchUser = z.infer<typeof SearchUserSchema>;

  export const HighlightSchema = z.object({
    value: z.string().describe('The highlighted text with HTML markup'),
    matchLevel: z
      .string()
      .describe('The level of the match (full, partial, none)'),
    matchedWords: z.array(z.string()).describe('The words that matched'),
    fullyHighlighted: z
      .boolean()
      .optional()
      .describe('Whether the entire text is highlighted'),
  });
  export type Highlight = z.infer<typeof HighlightSchema>;

  export const SearchHighlightResultSchema = z.object({
    author: HighlightSchema.describe('Highlighted author information'),
    title: HighlightSchema.optional().describe('Highlighted title information'),
    url: HighlightSchema.optional().describe('Highlighted URL information'),
    comment_text: HighlightSchema.optional().describe(
      'Highlighted comment text information',
    ),
    story_title: HighlightSchema.optional().describe(
      'Highlighted story title information',
    ),
    story_url: HighlightSchema.optional().describe(
      'Highlighted story URL information',
    ),
  });
  export type SearchHighlightResult = z.infer<
    typeof SearchHighlightResultSchema
  >;

  export const SearchHitSchema = z.object({
    objectID: z.string().describe('The unique ID of the hit'),
    url: z.string().describe('The URL of the story'),
    title: z.string().describe('The title of the story'),
    author: z.string().describe('The username of the author'),
    story_text: z.string().optional().describe('The text of the story'),
    story_id: z.number().optional().describe('The id of the story'),
    story_url: z.string().optional().describe('The URL of the story'),
    comment_text: z.string().optional().describe('The text of the comment'),
    points: z.number().optional().describe('The number of points'),
    num_comments: z.number().optional().describe('The number of comments'),
    created_at: z.string().describe('Creation date in ISO 8601 format'),
    created_at_i: z.number().describe('Creation date in Unix Time'),
    updated_at: z.string().describe('Last update date in ISO 8601 format'),
    parts: z.array(z.number()).optional().describe('Parts of polls'),
    children: z.array(z.number()).describe('Children comments'),
    _tags: z.array(z.string()).describe('Tags associated with the item'),
    _highlightResult: SearchHighlightResultSchema.describe(
      'Highlighted parts of the hit',
    ),
  });
  export type SearchHit = z.infer<typeof SearchHitSchema>;

  export const SearchResponseSchema = z.object({
    hits: z.array(SearchHitSchema).describe('The search results'),
    page: z.number().describe('The current page'),
    nbHits: z.number().describe('The total number of hits'),
    nbPages: z.number().describe('The total number of pages'),
    hitsPerPage: z.number().describe('The number of hits per page'),
    query: z.string().describe('The search query'),
    params: z.string().describe('The search parameters'),
    processingTimeMS: z
      .number()
      .describe('The processing time in milliseconds'),
    serverTimeMS: z.number().describe('The server time in milliseconds'),
    processingTimingsMS: z
      .any()
      .optional()
      .describe('Detailed processing timings'),
  });
  export type SearchResponse = z.infer<typeof SearchResponseSchema>;

  export const searchTagSchema = z.union([
    z.literal('story'),
    z.literal('comment'),
    z.literal('poll'),
    z.literal('pollopt'),
    z.literal('show_hn'),
    z.literal('ask_hn'),
    z.literal('front_page'),
  ]);

  export const searchSortBySchema = z.union([
    z.literal('relevance'),
    z.literal('recency'),
  ]);

  export const searchOptionsSchema = z.object({
    query: z.string().optional().describe('Full-text search query'),
    author: z.string().optional().describe("Filter by author's HN username"),
    story: z.string().optional().describe('Filter by story id'),
    tags: z
      .array(hackernews.searchTagSchema)
      .optional()
      .describe(
        "Filter by type of item (story, comment, etc.). Multiple tags are AND'ed together.",
      ),
    numericFilters: z
      .array(z.any())
      .optional()
      .describe(
        'Filter by numeric range (created_at_i, points, or num_comments); (created_at_i is a timestamp in seconds). Ex: numericFilters=points>100,num_comments>=1000',
      ),
    page: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .describe('Page number to return'),
    hitsPerPage: z
      .number()
      .int()
      .positive()
      .optional()
      .describe('Number of results to return per page (defaults to 50)'),
    sortBy: hackernews.searchSortBySchema
      .optional()
      .describe('How to sort the results (defaults to relevancy)'),
  });
}

/**
 * Client for accessing the Hacker News API and the Algolia Hacker News Search API.
 *
 * @see https://github.com/HackerNews/API
 * @see https://hn.algolia.com/api
 */
export class HackerNewsClient extends AIFunctionsProvider {
  /** Default URLs of the APIs. */
  protected readonly apiBaseUrl: string;
  protected readonly searchApiBaseUrl: string;

  /** Basic HTTP client for fetching data. */
  protected readonly ky: KyInstance;
  protected readonly searchKy: KyInstance;

  constructor({
    apiBaseUrl = hackernews.API_BASE_URL,
    searchApiBaseUrl = hackernews.SEARCH_API_BASE_URL,
    ky = defaultKy,
  }: {
    apiBaseUrl?: string;
    searchApiBaseUrl?: string;
    ky?: KyInstance;
  } = {}) {
    super();

    this.apiBaseUrl = apiBaseUrl;
    this.searchApiBaseUrl = searchApiBaseUrl;

    this.ky = ky.extend({
      prefixUrl: apiBaseUrl,
      timeout: 10000,
      headers: { accept: 'application/json' },
    });

    this.searchKy = ky.extend({
      prefixUrl: searchApiBaseUrl,
      timeout: 10000,
      headers: { accept: 'application/json' },
    });
  }

  /**
   * Gets the top stories or `n` most recent stories, in reverse chronological order, from the Hacker News API.
   *
   * @param limitOrOptions - Maximum number of stories to return, or options object
   */
  @aiFunction({
    name: 'get_top_hacker_news_stories',
    description:
      'Gets the top stories from Hacker News, in descending order by score. Includes the most popular stories from "Show HN" and "Ask HN" posts.',
    inputSchema: z.object({
      limit: z
        .number()
        .int()
        .positive()
        .default(10)
        .optional()
        .describe(
          'Maximum number of top stories to return, between 1 and 500. Default: 10',
        ),
    }),
  })
  async getTopStories({
    limit = 10,
  }: {
    limit?: number;
  } = {}): Promise<hackernews.Item[]> {
    const ids = await this.ky.get('topstories.json').json<number[]>();
    const storyIds = ids.slice(0, limit);
    return Promise.all(storyIds.map(id => this.getItem({ id })));
  }

  /**
   * Gets the newest stories, in reverse chronological order, from the Hacker News API.
   *
   * @param limitOrOptions - Maximum number of stories to return, or options object
   */
  @aiFunction({
    name: 'get_new_hacker_news_stories',
    description:
      'Gets the newest stories from Hacker News, in reverse chronological order (newest first).',
    inputSchema: z.object({
      limit: z
        .number()
        .int()
        .positive()
        .default(10)
        .optional()
        .describe(
          'Maximum number of new stories to return, between 1 and 500. Default: 10',
        ),
    }),
  })
  async getNewStories({
    limit = 10,
  }: {
    limit?: number;
  } = {}): Promise<hackernews.Item[]> {
    const ids = await this.ky.get('newstories.json').json<number[]>();
    const storyIds = ids.slice(0, limit);
    return Promise.all(storyIds.map(id => this.getItem({ id })));
  }

  /**
   * Gets the best stories, in reverse chronological order, from the Hacker News API.
   *
   * @param limitOrOptions - Maximum number of stories to return, or options object
   */
  @aiFunction({
    name: 'get_best_hacker_news_stories',
    description:
      'Gets the best stories from Hacker News, based on a time-decayed score.',
    inputSchema: z.object({
      limit: z
        .number()
        .int()
        .positive()
        .default(10)
        .optional()
        .describe(
          'Maximum number of best stories to return, between 1 and 500. Default: 10',
        ),
    }),
  })
  async getBestStories({
    limit = 10,
  }: {
    limit?: number;
  } = {}): Promise<hackernews.Item[]> {
    const ids = await this.ky.get('beststories.json').json<number[]>();
    const storyIds = ids.slice(0, limit);
    return Promise.all(storyIds.map(id => this.getItem({ id })));
  }

  /**
   * Gets the "Show HN" stories, in reverse chronological order, from the Hacker News API.
   *
   * @param limitOrOptions - Maximum number of stories to return, or options object
   */
  @aiFunction({
    name: 'get_show_hacker_news_stories',
    description:
      'Gets the "Show HN" stories from Hacker News, where users share their projects or interesting finds.',
    inputSchema: z.object({
      limit: z
        .number()
        .int()
        .positive()
        .default(10)
        .optional()
        .describe(
          'Maximum number of "Show HN" stories to return, between 1 and 500. Default: 10',
        ),
    }),
  })
  async getShowStories({
    limit = 10,
  }: {
    limit?: number;
  } = {}): Promise<hackernews.Item[]> {
    const ids = await this.ky.get('showstories.json').json<number[]>();
    const storyIds = ids.slice(0, limit);
    return Promise.all(storyIds.map(id => this.getItem({ id })));
  }

  /**
   * Gets the "Ask HN" stories, in reverse chronological order, from the Hacker News API.
   *
   * @param limitOrOptions - Maximum number of stories to return, or options object
   */
  @aiFunction({
    name: 'get_ask_hacker_news_stories',
    description:
      'Gets the "Ask HN" stories from Hacker News, where users ask the community questions.',
    inputSchema: z.object({
      limit: z
        .number()
        .int()
        .positive()
        .default(10)
        .optional()
        .describe(
          'Maximum number of "Ask HN" stories to return, between 1 and 500. Default: 10',
        ),
    }),
  })
  async getAskStories({
    limit = 10,
  }: {
    limit?: number;
  } = {}): Promise<hackernews.Item[]> {
    const ids = await this.ky.get('askstories.json').json<number[]>();
    const storyIds = ids.slice(0, limit);
    return Promise.all(storyIds.map(id => this.getItem({ id })));
  }

  /**
   * Gets job posts from the Hacker News API.
   *
   * @param limitOrOptions - Maximum number of job posts to return, or options object
   */
  @aiFunction({
    name: 'get_job_posts',
    description: 'Gets the latest job postings from Hacker News.',
    inputSchema: z.object({
      limit: z
        .number()
        .int()
        .positive()
        .default(10)
        .optional()
        .describe(
          'Maximum number of job posts to return, between 1 and 500. Default: 10',
        ),
    }),
  })
  async getJobStories({
    limit = 10,
  }: {
    limit?: number;
  } = {}): Promise<hackernews.Item[]> {
    const ids = await this.ky.get('jobstories.json').json<number[]>();
    const storyIds = ids.slice(0, limit);
    return Promise.all(storyIds.map(id => this.getItem({ id })));
  }

  /**
   * Gets a single item (story, comment, job, poll, or pollopt) by ID from the Hacker News API.
   *
   * @param idOrOptions - The ID of the item to get, or an object with options
   */
  @aiFunction({
    name: 'get_hacker_news_item',
    description:
      'Gets a specific item (story, comment, job, poll, or poll option) by ID from Hacker News.',
    inputSchema: z.object({
      id: z.number().int().positive().describe('The ID of the item to get'),
    }),
  })
  async getItem({ id }: { id: number }): Promise<hackernews.Item> {
    return hackernews.ItemSchema.parse(
      await this.ky.get(`item/${id}.json`).json(),
    );
  }

  /**
   * Retrieves all items in a comment thread, including all child comments,
   * by repeatedly calling the Hacker News API.
   *
   * @param idOrOptions - The ID of the item to get, or an object with options
   */
  @aiFunction({
    name: 'get_hacker_news_thread',
    description:
      'Gets a full comment thread from Hacker News, including all nested comments.',
    inputSchema: z.object({
      id: z
        .number()
        .int()
        .positive()
        .describe('The ID of the story or comment thread to get'),
    }),
  })
  async getItemWithComments({
    id,
  }: {
    id: number;
  }): Promise<hackernews.Item & { comments?: hackernews.Item[] }> {
    const item = await this.getItem({ id });

    // Recursively fetch child comments
    if (item.kids?.length) {
      const comments = await Promise.all(
        item.kids.map(kidId => this.getItemWithComments({ id: kidId })),
      );
      // Add comments as a property for convenience
      return { ...item, comments: comments.filter(Boolean) };
    }

    return item;
  }

  /**
   * Gets a user profile by username from the Hacker News API.
   *
   * @param idOrOptions - The username of the user to get, or an object with options
   */
  @aiFunction({
    name: 'get_hacker_news_user',
    description: 'Gets a user profile by username from Hacker News.',
    inputSchema: z.object({
      id: z
        .string()
        .describe('The username of the user to get (case-sensitive)'),
    }),
  })
  async getUser({ id }: { id: string }): Promise<hackernews.User> {
    return hackernews.UserSchema.parse(
      await this.ky.get(`user/${id}.json`).json(),
    );
  }

  /**
   * Search Hacker News using the Algolia Hacker News Search API.
   *
   * @see https://hn.algolia.com/api
   */
  @aiFunction({
    name: 'search_hacker_news',
    description:
      'Search Hacker News stories, comments, and users using full-text search.',
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          'The search query. Searches across titles, URLs, authors, and text.',
        ),
      author: z
        .string()
        .optional()
        .describe('Filter results to a specific author (username)'),
      tags: z
        .array(z.string())
        .optional()
        .describe(
          'Filter results by type (e.g., "story", "comment", "ask_hn", "show_hn", "front_page", etc.)',
        ),
      numericFilters: z
        .array(z.string())
        .optional()
        .describe(
          'Filter results by numeric properties like creation date, points, or comment count. Example: ["points>10", "num_comments>5"]',
        ),
      page: z
        .number()
        .int()
        .nonnegative()
        .optional()
        .describe('Page number for pagination. Starts at 0.'),
      hitsPerPage: z
        .number()
        .int()
        .positive()
        .optional()
        .describe('Number of results per page. Max 1000.'),
      sortBy: z
        .string()
        .optional()
        .describe(
          'How to sort results: "search" (relevance, default), "search_by_date" (newest first), "points" (highest points first), or "num_comments" (most comments first)',
        ),
    }),
  })
  async search(
    options: hackernews.SearchOptions,
  ): Promise<hackernews.SearchResponse> {
    const {
      query,
      author,
      tags,
      numericFilters,
      page,
      hitsPerPage,
      sortBy = 'search',
    } = options;

    const tagsQuery = [];
    if (tags) {
      tagsQuery.push(...tags);
    }
    if (author) {
      tagsQuery.push(`author_${author}`);
    }

    const params = pruneNullOrUndefined({
      query,
      tags: tagsQuery.length > 0 ? tagsQuery.join(',') : undefined,
      numericFilters: numericFilters ? numericFilters.join(',') : undefined,
      page,
      hitsPerPage,
    });

    // Default to search (relevance), but allow other sort orders
    const endpoint = sortBy === 'search' ? 'search' : `${sortBy}`;

    const response = await this.searchKy
      .get(`api/v1/${endpoint}`, {
        searchParams: sanitizeSearchParams(params),
      })
      .json();

    return hackernews.SearchResponseSchema.parse(response);
  }
}
