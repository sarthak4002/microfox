import { GoogleOAuthSdk } from '@microfox/google-oauth';
import { z } from 'zod';
import {
  ReportQueryParams,
  ReportResponse,
  Group,
  GroupListResponse,
  GroupItem,
  GroupItemListResponse,
  YouTubeAnalyticsAPISDKParams,
} from './types';
import {
  reportQueryParamsSchema,
  reportResponseSchema,
  groupSchema,
  groupListResponseSchema,
  groupItemSchema,
  groupItemListResponseSchema,
} from './schemas';

export class YouTubeAnalyticsAPISDK {
  private readonly baseUrl = 'https://youtubeanalytics.googleapis.com/v2';
  private readonly googleOAuth: GoogleOAuthSdk;
  private accessToken: string;

  constructor(params: YouTubeAnalyticsAPISDKParams) {
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

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    params?: Record<string, string | number | boolean>,
    body?: unknown
  ): Promise<T> {
    await this.ensureValidAccessToken();

    const url = new URL(`${this.baseUrl}${endpoint}`);
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

    return response.json() as Promise<T>;
  }

  async reportsQuery(params: ReportQueryParams): Promise<ReportResponse> {
    const validatedParams = reportQueryParamsSchema.parse(params);
    const response = await this.makeRequest<ReportResponse>('/reports', 'GET', validatedParams);
    return reportResponseSchema.parse(response);
  }

  async listGroups(params?: {
    mine?: boolean;
    id?: string;
    onBehalfOfContentOwner?: string;
  }): Promise<GroupListResponse> {
    const response = await this.makeRequest<GroupListResponse>('/groups', 'GET', params);
    return groupListResponseSchema.parse(response);
  }

  async insertGroup(group: Omit<Group, 'id'>): Promise<Group> {
    const response = await this.makeRequest<Group>('/groups', 'POST', undefined, group);
    return groupSchema.parse(response);
  }

  async updateGroup(group: Group): Promise<Group> {
    const response = await this.makeRequest<Group>('/groups', 'PUT', undefined, group);
    return groupSchema.parse(response);
  }

  async deleteGroup(id: string, onBehalfOfContentOwner?: string): Promise<void> {
    await this.makeRequest<void>(`/groups/${id}`, 'DELETE', { onBehalfOfContentOwner });
  }

  async listGroupItems(params: {
    groupId: string;
    onBehalfOfContentOwner?: string;
  }): Promise<GroupItemListResponse> {
    const response = await this.makeRequest<GroupItemListResponse>('/groupItems', 'GET', params);
    return groupItemListResponseSchema.parse(response);
  }

  async insertGroupItem(groupItem: Omit<GroupItem, 'id'>): Promise<GroupItem> {
    const response = await this.makeRequest<GroupItem>('/groupItems', 'POST', undefined, groupItem);
    return groupItemSchema.parse(response);
  }

  async deleteGroupItem(id: string, onBehalfOfContentOwner?: string): Promise<void> {
    await this.makeRequest<void>(`/groupItems/${id}`, 'DELETE', { onBehalfOfContentOwner });
  }
}

export function createYoutubeAnalyticsAPISDK(params: YouTubeAnalyticsAPISDKParams): YouTubeAnalyticsAPISDK {
  return new YouTubeAnalyticsAPISDK(params);
}
