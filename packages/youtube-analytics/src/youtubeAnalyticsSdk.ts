import { z } from 'zod';
import { GoogleOAuthSdk } from '@microfox/google-oauth';

const YOUTUBE_ANALYTICS_BASE_URL = 'https://youtubeanalytics.googleapis.com/v2';

// Zod schemas for input validation
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD');
const idSchema = z.string().min(1, 'ID must not be empty');
const metricsSchema = z.string().min(1, 'Metrics must not be empty');
const currencySchema = z.string().length(3, 'Currency must be a 3-letter ISO 4217 code');
const dimensionsSchema = z.string().optional();
const filtersSchema = z.string().optional();
const booleanSchema = z.boolean().optional();
const integerSchema = z.number().int().optional();
const sortSchema = z.string().optional();

const reportsQueryParamsSchema = z.object({
  endDate: dateSchema,
  ids: idSchema,
  metrics: metricsSchema,
  startDate: dateSchema,
  currency: currencySchema.optional(),
  dimensions: dimensionsSchema,
  filters: filtersSchema,
  includeHistoricalChannelData: booleanSchema,
  maxResults: integerSchema,
  sort: sortSchema,
  startIndex: integerSchema,
});

const groupListParamsSchema = z.object({
  id: z.string().optional(),
  mine: z.boolean().optional(),
  onBehalfOfContentOwner: z.string().optional(),
  pageToken: z.string().optional(),
});

const groupInsertParamsSchema = z.object({
  onBehalfOfContentOwner: z.string().optional(),
});

const groupUpdateParamsSchema = z.object({
  onBehalfOfContentOwner: z.string().optional(),
});

const groupDeleteParamsSchema = z.object({
  id: idSchema,
  onBehalfOfContentOwner: z.string().optional(),
});

const groupItemsListParamsSchema = z.object({
  groupId: idSchema,
  onBehalfOfContentOwner: z.string().optional(),
});

const groupItemsInsertParamsSchema = z.object({
  onBehalfOfContentOwner: z.string().optional(),
});

const groupItemsDeleteParamsSchema = z.object({
  id: idSchema,
  onBehalfOfContentOwner: z.string().optional(),
});

export class YoutubeAnalyticsSDK {
  private googleOAuth: GoogleOAuthSdk;
  private accessToken: string;

  constructor(params: {
    accessToken: string;
    refreshToken?: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  }) {
    this.googleOAuth = new GoogleOAuthSdk({
      clientId: params.clientId,
      clientSecret: params.clientSecret,
      redirectUri: params.redirectUri,
      scopes: [
        'https://www.googleapis.com/auth/yt-analytics.readonly',
        'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtubepartner',
      ],
    });
    this.accessToken = params.accessToken;
  }

  private async ensureValidAccessToken(): Promise<void> {
    try {
      const validationResult = await this.googleOAuth.validateAccessToken(this.accessToken);
      if (!validationResult.isValid) {
        throw new Error('Invalid access token');
      }
    } catch (error) {
      throw new Error(`Failed to validate access token: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', params?: Record<string, any>, body?: any): Promise<any> {
    await this.ensureValidAccessToken();

    const url = new URL(`${YOUTUBE_ANALYTICS_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    if (method === 'DELETE') {
      return undefined;
    }

    return await response.json();
  }

  async reportsQuery(params: z.infer<typeof reportsQueryParamsSchema>): Promise<any> {
    const validatedParams = reportsQueryParamsSchema.parse(params);
    return this.makeRequest('/reports', 'GET', validatedParams);
  }

  async groupsList(params: z.infer<typeof groupListParamsSchema>): Promise<any> {
    const validatedParams = groupListParamsSchema.parse(params);
    return this.makeRequest('/groups', 'GET', validatedParams);
  }

  async groupsInsert(params: z.infer<typeof groupInsertParamsSchema>, group: any): Promise<any> {
    const validatedParams = groupInsertParamsSchema.parse(params);
    return this.makeRequest('/groups', 'POST', validatedParams, group);
  }

  async groupsUpdate(params: z.infer<typeof groupUpdateParamsSchema>, group: any): Promise<any> {
    const validatedParams = groupUpdateParamsSchema.parse(params);
    return this.makeRequest('/groups', 'PUT', validatedParams, group);
  }

  async groupsDelete(params: z.infer<typeof groupDeleteParamsSchema>): Promise<void> {
    const validatedParams = groupDeleteParamsSchema.parse(params);
    await this.makeRequest('/groups', 'DELETE', validatedParams);
  }

  async groupItemsList(params: z.infer<typeof groupItemsListParamsSchema>): Promise<any> {
    const validatedParams = groupItemsListParamsSchema.parse(params);
    return this.makeRequest('/groupItems', 'GET', validatedParams);
  }

  async groupItemsInsert(params: z.infer<typeof groupItemsInsertParamsSchema>, groupItem: any): Promise<any> {
    const validatedParams = groupItemsInsertParamsSchema.parse(params);
    return this.makeRequest('/groupItems', 'POST', validatedParams, groupItem);
  }

  async groupItemsDelete(params: z.infer<typeof groupItemsDeleteParamsSchema>): Promise<void> {
    const validatedParams = groupItemsDeleteParamsSchema.parse(params);
    await this.makeRequest('/groupItems', 'DELETE', validatedParams);
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const result = await this.googleOAuth.refreshAccessToken(refreshToken);
      this.accessToken = result.accessToken;
      return result;
    } catch (error) {
      throw new Error(`Failed to refresh access token: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export function createYoutubeAnalyticsSDK(params: {
  accessToken: string;
  refreshToken?: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): YoutubeAnalyticsSDK {
  return new YoutubeAnalyticsSDK(params);
}
