import { GoogleOAuthSdk } from '@microfox/google-oauth';
import { z } from 'zod';
import {
  ReportQueryParams,
  ReportResponse,
  GroupListParams,
  GroupListResponse,
  Group,
  GroupItemListParams,
  GroupItemListResponse,
  GroupItem,
} from './types';
import {
  reportQueryParamsSchema,
  groupListParamsSchema,
  groupSchema,
  groupItemListParamsSchema,
  groupItemSchema,
} from './schemas';

export class YoutubeAnalyticsSDK {
  private googleOAuth: GoogleOAuthSdk;
  private accessToken: string;
  private baseUrl = 'https://youtubeanalytics.googleapis.com/v2';

  constructor(config: {
    accessToken: string;
    refreshToken?: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  }) {
    this.accessToken = config.accessToken;
    this.googleOAuth = new GoogleOAuthSdk({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri,
      scopes: [
        'https://www.googleapis.com/auth/yt-analytics.readonly',
        'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtubepartner',
      ],
    });
  }

  private async ensureValidToken(): Promise<void> {
    try {
      const validationResult = await this.googleOAuth.validateAccessToken(this.accessToken);
      if (!validationResult.isValid) {
        throw new Error('Invalid access token');
      }
    } catch (error) {
      throw new Error(`Token validation failed: ${(error as Error).message}`);
    }
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    await this.ensureValidToken();
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`API request failed: ${errorBody.error.message}`);
    }

    return response;
  }

  async getReports(params: ReportQueryParams): Promise<ReportResponse> {
    const validatedParams = reportQueryParamsSchema.parse(params);
    const queryString = new URLSearchParams(validatedParams as any).toString();
    const url = `${this.baseUrl}/reports?${queryString}`;

    const response = await this.fetchWithAuth(url);
    return response.json();
  }

  async listGroups(params: GroupListParams): Promise<GroupListResponse> {
    const validatedParams = groupListParamsSchema.parse(params);
    const queryString = new URLSearchParams(validatedParams as any).toString();
    const url = `${this.baseUrl}/groups?${queryString}`;

    const response = await this.fetchWithAuth(url);
    return response.json();
  }

  async insertGroup(group: Omit<Group, 'id' | 'etag' | 'kind'>): Promise<Group> {
    const validatedGroup = groupSchema.omit({ id: true, etag: true, kind: true }).parse(group);
    const url = `${this.baseUrl}/groups`;

    const response = await this.fetchWithAuth(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedGroup),
    });

    return response.json();
  }

  async updateGroup(group: Pick<Group, 'id' | 'snippet'>): Promise<Group> {
    const validatedGroup = groupSchema.pick({ id: true, snippet: true }).parse(group);
    const url = `${this.baseUrl}/groups`;

    const response = await this.fetchWithAuth(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedGroup),
    });

    return response.json();
  }

  async deleteGroup(id: string): Promise<void> {
    const url = `${this.baseUrl}/groups?id=${id}`;

    await this.fetchWithAuth(url, {
      method: 'DELETE',
    });
  }

  async listGroupItems(params: GroupItemListParams): Promise<GroupItemListResponse> {
    const validatedParams = groupItemListParamsSchema.parse(params);
    const queryString = new URLSearchParams(validatedParams as any).toString();
    const url = `${this.baseUrl}/groupItems?${queryString}`;

    const response = await this.fetchWithAuth(url);
    return response.json();
  }

  async insertGroupItem(groupItem: Omit<GroupItem, 'id' | 'etag' | 'kind'>): Promise<GroupItem> {
    const validatedGroupItem = groupItemSchema.omit({ id: true, etag: true, kind: true }).parse(groupItem);
    const url = `${this.baseUrl}/groupItems`;

    const response = await this.fetchWithAuth(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedGroupItem),
    });

    return response.json();
  }

  async deleteGroupItem(id: string): Promise<void> {
    const url = `${this.baseUrl}/groupItems?id=${id}`;

    await this.fetchWithAuth(url, {
      method: 'DELETE',
    });
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const result = await this.googleOAuth.refreshAccessToken(refreshToken);
      this.accessToken = result.accessToken;
      return result;
    } catch (error) {
      throw new Error(`Failed to refresh access token: ${(error as Error).message}`);
    }
  }

  async validateAccessToken(): Promise<boolean> {
    try {
      const result = await this.googleOAuth.validateAccessToken(this.accessToken);
      return result.isValid;
    } catch (error) {
      throw new Error(`Failed to validate access token: ${(error as Error).message}`);
    }
  }
}

export function createYoutubeAnalyticsSDK(config: {
  accessToken: string;
  refreshToken?: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): YoutubeAnalyticsSDK {
  return new YoutubeAnalyticsSDK(config);
}
