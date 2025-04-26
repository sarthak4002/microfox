import { z } from 'zod';
import {
  redditSDKConfigSchema,
  userSchema,
  postSchema,
  commentSchema,
  subredditSchema,
  searchResultSchema,
  voteDirectionSchema,
  listingParamsSchema,
} from '../schemas';

export type RedditSDKConfig = z.infer<typeof redditSDKConfigSchema>;
export type User = z.infer<typeof userSchema>;
export type Post = z.infer<typeof postSchema>;
export type Comment = z.infer<typeof commentSchema>;
export type Subreddit = z.infer<typeof subredditSchema>;
export type SearchResult = z.infer<typeof searchResultSchema>;
export type VoteDirection = z.infer<typeof voteDirectionSchema>;
export type ListingParams = z.infer<typeof listingParamsSchema>;

export { redditSDKConfigSchema, userSchema, postSchema, commentSchema, subredditSchema, searchResultSchema, voteDirectionSchema, listingParamsSchema };
