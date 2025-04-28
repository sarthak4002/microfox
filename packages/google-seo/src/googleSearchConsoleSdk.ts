import { z } from 'zod';
import { GoogleOAuthSdk, GoogleScope } from '@microfox/google-oauth';
import {
  SitesResource,
  SitemapResource,
  SearchAnalyticsRow,
  UrlInspectionResult,
  GoogleSearchConsoleSDKOptions,
  SearchAnalyticsQueryParams,
  UrlInspectionParams,
} from './types';
import {
  sitesResourceSchema,
  sitemapResourceSchema,
  searchAnalyticsRowSchema,
  urlInspectionResultSchema,
  googleSearchConsoleSDKOptionsSchema,
  searchAnalyticsQueryParamsSchema,
  urlInspectionParamsSchema,
} from './schemas';

export class GoogleSearchConsoleSDK {
  private readonly baseUrl = 'https://www.googleapis.com/webmasters/v3';
  private readonly oauth: GoogleOAuthSdk;
  private accessToken: string;

  constructor(options: GoogleSearchConsoleSDKOptions) {
    const validatedOptions = googleSearchConsoleSDKOptionsSchema.parse(options);
    this.oauth = new GoogleOAuthSdk({
      clientId: validatedOptions.clientId,
      clientSecret: validatedOptions.clientSecret,
      redirectUri: validatedOptions.redirectUri,
      scopes: [GoogleScope.WEBMASTERS, GoogleScope.WEBMASTERS_READONLY],
    });
    this.accessToken = validatedOptions.accessToken;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: unknown,
    params?: Record<string, string>,
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${errorData.error.message}`);
    }

    return response.json() as Promise<T>;
  }

  async validateAccessToken(): Promise<void> {
    try {
      const result = await this.oauth.validateAccessToken(this.accessToken);
      if (!result.isValid) {
        throw new Error('Invalid access token');
      }
    } catch (error) {
      throw new Error(
        `Failed to validate access token: ${(error as Error).message}`,
      );
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<void> {
    try {
      const result = await this.oauth.refreshAccessToken(refreshToken);
      this.accessToken = result.accessToken;
    } catch (error) {
      throw new Error(
        `Failed to refresh access token: ${(error as Error).message}`,
      );
    }
  }

  async listSites(): Promise<SitesResource[]> {
    const response = await this.request<{ siteEntry: SitesResource[] }>(
      '/sites',
      'GET',
    );
    return response.siteEntry.map(site => sitesResourceSchema.parse(site));
  }

  async getSite(siteUrl: string): Promise<SitesResource> {
    const response = await this.request<SitesResource>(
      `/sites/${encodeURIComponent(siteUrl)}`,
      'GET',
    );
    return sitesResourceSchema.parse(response);
  }

  async addSite(siteUrl: string): Promise<void> {
    await this.request(`/sites/${encodeURIComponent(siteUrl)}`, 'PUT');
  }

  async deleteSite(siteUrl: string): Promise<void> {
    await this.request(`/sites/${encodeURIComponent(siteUrl)}`, 'DELETE');
  }

  async listSitemaps(
    siteUrl: string,
    sitemapIndex?: string,
  ): Promise<SitemapResource[]> {
    const params: Record<string, string> = {};
    if (sitemapIndex) {
      params.sitemapIndex = sitemapIndex;
    }
    const response = await this.request<{ sitemap: SitemapResource[] }>(
      `/sites/${encodeURIComponent(siteUrl)}/sitemaps`,
      'GET',
      undefined,
      params,
    );
    return response.sitemap.map(sitemap =>
      sitemapResourceSchema.parse(sitemap),
    );
  }

  async getSitemap(
    siteUrl: string,
    feedpath: string,
  ): Promise<SitemapResource> {
    const response = await this.request<SitemapResource>(
      `/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(feedpath)}`,
      'GET',
    );
    return sitemapResourceSchema.parse(response);
  }

  async submitSitemap(siteUrl: string, feedpath: string): Promise<void> {
    await this.request(
      `/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(feedpath)}`,
      'PUT',
    );
  }

  async deleteSitemap(siteUrl: string, feedpath: string): Promise<void> {
    await this.request(
      `/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(feedpath)}`,
      'DELETE',
    );
  }

  async querySearchAnalytics(
    siteUrl: string,
    params: SearchAnalyticsQueryParams,
  ): Promise<{ rows: SearchAnalyticsRow[]; responseAggregationType: string }> {
    const validatedParams = searchAnalyticsQueryParamsSchema.parse(params);
    const response = await this.request<{
      rows: SearchAnalyticsRow[];
      responseAggregationType: string;
    }>(
      `/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      'POST',
      validatedParams,
    );
    return {
      rows: response.rows.map(row => searchAnalyticsRowSchema.parse(row)),
      responseAggregationType: response.responseAggregationType,
    };
  }

  async inspectUrl(params: UrlInspectionParams): Promise<UrlInspectionResult> {
    const validatedParams = urlInspectionParamsSchema.parse(params);
    const response = await this.request<{
      inspectionResult: UrlInspectionResult;
    }>('/urlInspection/index:inspect', 'POST', validatedParams);
    return response.inspectionResult;
  }
}

export function createGoogleSearchConsoleSDK(
  options: GoogleSearchConsoleSDKOptions,
): GoogleSearchConsoleSDK {
  return new GoogleSearchConsoleSDK(options);
}
