import { z } from 'zod';
import { createRedditOAuth } from '@microfox/reddit-oauth';
import {
  RedditSDKConfig,
  User,
  Post,
  Comment,
  Subreddit,
  SearchResult,
  VoteDirection,
  ListingParams,
} from './types';
import {
  redditSDKConfigSchema,
  userSchema,
  postSchema,
  commentSchema,
  subredditSchema,
  searchResultSchema,
  voteDirectionSchema,
  listingParamsSchema,
} from './schemas';

export class RedditSDK {
  private oauth: ReturnType<typeof createRedditOAuth>;
  private accessToken: string;
  private baseUrl = 'https://oauth.reddit.com';

  constructor(config: RedditSDKConfig) {
    const validatedConfig = redditSDKConfigSchema.parse(config);
    this.oauth = createRedditOAuth({
      clientId: validatedConfig.clientId,
      clientSecret: validatedConfig.clientSecret,
      redirectUri: validatedConfig.redirectUri,
      scopes: validatedConfig.scopes,
    });
    this.accessToken = validatedConfig.accessToken;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: unknown
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async validateAccessToken(): Promise<boolean> {
    return this.oauth.validateAccessToken(this.accessToken);
  }

  async refreshAccessToken(refreshToken: string): Promise<void> {
    const result = await this.oauth.refreshAccessToken(refreshToken);
    this.accessToken = result.access_token;
  }

  async getMe(): Promise<User> {
    const data = await this.request<User>('/api/v1/me');
    return data;
  }

  async getUserPreferences(): Promise<Record<string, unknown>> {
    return this.request('/api/v1/me/prefs');
  }

  async updateUserPreferences(prefs: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request('/api/v1/me/prefs', 'PATCH', prefs);
  }

  async getUserKarma(): Promise<Record<string, { link_karma: number; comment_karma: number }>> {
    return this.request('/api/v1/me/karma');
  }

  async getUserTrophies(): Promise<unknown> {
    return this.request('/api/v1/me/trophies');
  }

  async getUser(username: string): Promise<User> {
    const data = await this.request<User>(`/user/${username}/about`);
    return data;
  }

  async getUserContent(
    username: string,
    section: 'overview' | 'submitted' | 'comments' | 'upvoted' | 'downvoted' | 'hidden' | 'saved' | 'gilded',
    params: ListingParams = {}
  ): Promise<(Post | Comment)[]> {
    const validatedParams = listingParamsSchema.parse(params);
    const queryParams = new URLSearchParams(validatedParams as Record<string, string>);
    const data = await this.request<{ data: { children: { data: Post | Comment }[] } }>(
      `/user/${username}/${section}?${queryParams}`
    );
    return data.data.children.map((child) => child.data);
  }

  async getSubredditInfo(subreddit: string): Promise<Subreddit> {
    const data = await this.request<Subreddit>(`/r/${subreddit}/about`);
    return data;
  }

  async searchSubreddit(
    subreddit: string,
    query: string,
    params: ListingParams & { sort?: 'relevance' | 'hot' | 'top' | 'new' | 'comments'; t?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' } = {}
  ): Promise<SearchResult[]> {
    const validatedParams = listingParamsSchema.extend({
      sort: z.enum(['relevance', 'hot', 'top', 'new', 'comments']).optional(),
      t: z.enum(['hour', 'day', 'week', 'month', 'year', 'all']).optional(),
    }).parse(params);
    const queryParams = new URLSearchParams(
      Object.fromEntries(
        Object.entries({ ...validatedParams, q: query }).map(([key, value]) => [key, String(value)])
      )
    );
    const data = await this.request<{ data: { children: { data: SearchResult }[] } }>(
      `/r/${subreddit}/search?${queryParams}`
    );
    return data.data.children.map((child) => child.data);
  }

  async search(
    query: string,
    params: ListingParams & { sort?: 'relevance' | 'hot' | 'top' | 'new' | 'comments'; t?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' } = {}
  ): Promise<SearchResult[]> {
    const validatedParams = listingParamsSchema.extend({
      sort: z.enum(['relevance', 'hot', 'top', 'new', 'comments']).optional(),
      t: z.enum(['hour', 'day', 'week', 'month', 'year', 'all']).optional(),
    }).parse(params);
    const queryParams = new URLSearchParams(
      Object.fromEntries(
        Object.entries({ ...validatedParams, q: query }).map(([key, value]) => [key, String(value)])
      )
    );
    const data = await this.request<{ data: { children: { data: SearchResult }[] } }>(
      `/search?${queryParams}`
    );
    return data.data.children.map((child) => child.data);
  }

  async submitComment(parentId: string, text: string): Promise<Comment> {
    const data = await this.request<{ json: { data: { things: [{ data: Comment }] } } }>(
      '/api/comment',
      'POST',
      { parent: parentId, text }
    );
    return data.json.data.things[0].data;
  }

  async submitPost(subreddit: string, title: string, content: { text?: string; url?: string }): Promise<Post> {
    const kind = content.text ? 'self' : 'link';
    const data = await this.request<{ json: { data: { name: string } } }>(
      '/api/submit',
      'POST',
      {
        sr: subreddit,
        kind,
        title,
        ...(kind === 'self' ? { text: content.text } : { url: content.url }),
      }
    );
    return this.getPost(data.json.data.name);
  }

  async vote(id: string, direction: VoteDirection): Promise<void> {
    const dir = voteDirectionSchema.parse(direction);
    await this.request('/api/vote', 'POST', { id, dir });
  }

  async deletePost(id: string): Promise<void> {
    await this.request('/api/del', 'POST', { id });
  }

  async editUserText(id: string, text: string): Promise<Post | Comment> {
    const data = await this.request<{ json: { data: { things: [{ data: Post | Comment }] } } }>(
      '/api/editusertext',
      'POST',
      { thing_id: id, text }
    );
    const editedContent = data.json.data.things[0].data;
    return editedContent;
  }

  async hidePost(id: string): Promise<void> {
    await this.request('/api/hide', 'POST', { id });
  }

  async unhidePost(id: string): Promise<void> {
    await this.request('/api/unhide', 'POST', { id });
  }

  async saveItem(id: string, category?: string): Promise<void> {
    await this.request('/api/save', 'POST', { id, category });
  }

  async unsaveItem(id: string): Promise<void> {
    await this.request('/api/unsave', 'POST', { id });
  }

  async reportItem(id: string, reason: string): Promise<void> {
    await this.request('/api/report', 'POST', { thing_id: id, reason });
  }

  async getInfo(ids: string[]): Promise<(Post | Comment | Subreddit)[]> {
    const data = await this.request<{ data: { children: { kind: string; data: Post | Comment | Subreddit }[] } }>(
      `/api/info?id=${ids.join(',')}`
    );
    return data.data.children.map((child) => {
      if (child.kind === 't1' || child.kind === 't3' || child.kind === 't5') {
        return child.data;
      } else {
        throw new Error(`Unknown item type: ${child.kind}`);
      }
    });
  }

  async getMoreComments(linkId: string, children: string[]): Promise<Comment[]> {
    const data = await this.request<{ json: { data: { things: { data: Comment }[] } } }>(
      '/api/morechildren',
      'GET',
      { link_id: linkId, children: children.join(',') }
    );
    return data.json.data.things.map((thing) => thing.data);
  }

  async getPost(id: string): Promise<Post> {
    const data = await this.request<{ data: { children: [{ data: Post }] } }>(`/api/info?id=${id}`);
    return data.data.children[0].data
  }

  // Add more methods for other endpoints as needed...
}

export function createRedditSDK(config: RedditSDKConfig): RedditSDK {
  return new RedditSDK(config);
}
