import { z } from 'zod';

export const redditSDKConfigSchema = z.object({
  clientId: z.string().describe('The client ID for your Reddit application'),
  clientSecret: z
    .string()
    .describe('The client secret for your Reddit application'),
  accessToken: z.string().describe('The OAuth access token'),
  refreshToken: z
    .string()
    .optional()
    .describe('The OAuth refresh token (if available)'),
  redirectUri: z
    .string()
    .url()
    .describe('The redirect URI for your Reddit application'),
  scopes: z
    .array(z.string())
    .describe('The OAuth scopes required for your application'),
});

export const userSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    created: z.number(),
    link_karma: z.number(),
    comment_karma: z.number(),
    is_gold: z.boolean(),
    is_mod: z.boolean(),
    has_verified_email: z.boolean(),
  })
  .describe('Reddit user information');

export const postSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    author: z.string(),
    subreddit: z.string(),
    score: z.number(),
    created_utc: z.number(),
    num_comments: z.number(),
    url: z.string().url(),
    selftext: z.string().optional(),
  })
  .describe('Reddit post information');

export const commentSchema = z
  .object({
    id: z.string(),
    author: z.string(),
    body: z.string(),
    score: z.number(),
    created_utc: z.number(),
    subreddit: z.string(),
    link_id: z.string(),
    parent_id: z.string(),
  })
  .describe('Reddit comment information');

export const subredditSchema = z
  .object({
    id: z.string(),
    display_name: z.string(),
    title: z.string(),
    public_description: z.string(),
    subscribers: z.number(),
    created_utc: z.number(),
    over18: z.boolean(),
  })
  .describe('Reddit subreddit information');

export const searchResultSchema = z
  .union([postSchema, commentSchema, subredditSchema])
  .describe('Search result, which can be a post, comment, or subreddit');

export const voteDirectionSchema = z
  .enum(['1', '0', '-1'])
  .describe('Vote direction: 1 for upvote, -1 for downvote, 0 for no vote');

export const listingParamsSchema = z
  .object({
    after: z
      .string()
      .optional()
      .describe('Fullname of an item to use as the anchor point of the slice'),
    before: z
      .string()
      .optional()
      .describe('Fullname of an item to use as the anchor point of the slice'),
    limit: z
      .number()
      .min(1)
      .max(100)
      .optional()
      .describe(
        'Maximum number of items to return (default: 25, maximum: 100)',
      ),
    count: z
      .number()
      .optional()
      .describe('The number of items already seen in this listing'),
    show: z
      .enum(['all'])
      .optional()
      .describe('Optional parameter to show all items'),
  })
  .describe('Common parameters for Reddit API listing endpoints');
