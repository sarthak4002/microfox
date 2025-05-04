import { z } from 'zod';
import { GoogleOAuthSdk } from '@microfox/google-oauth';

const YouTubeReportingAPIConfigSchema = z.object({
  clientId: z.string().min(1).describe('The client ID for the Google OAuth 2.0 credentials'),
  clientSecret: z.string().min(1).describe('The client secret for the Google OAuth 2.0 credentials'),
  redirectUri: z.string().url().describe('The redirect URI for the Google OAuth 2.0 flow'),
  accessToken: z.string().optional().describe('The access token for authenticated requests'),
  refreshToken: z.string().optional().describe('The refresh token to obtain new access tokens'),
});

type YouTubeReportingAPIConfig = z.infer<typeof YouTubeReportingAPIConfigSchema>;

const ReportTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  systemManaged: z.boolean().optional(),
});

const ListReportTypesResponseSchema = z.object({
  reportTypes: z.array(ReportTypeSchema),
  nextPageToken: z.string().optional(),
});

const JobSchema = z.object({
  id: z.string(),
  name: z.string(),
  reportTypeId: z.string(),
  createTime: z.string(),
});

const ListJobsResponseSchema = z.object({
  jobs: z.array(JobSchema),
  nextPageToken: z.string().optional(),
});

const ReportSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  createTime: z.string(),
  downloadUrl: z.string().optional(),
});

const ListReportsResponseSchema = z.object({
  reports: z.array(ReportSchema),
  nextPageToken: z.string().optional(),
});

export class YouTubeReportingAPISDK {
  private config: YouTubeReportingAPIConfig;
  private googleOAuth: GoogleOAuthSdk;

  constructor(config: YouTubeReportingAPIConfig) {
    this.config = YouTubeReportingAPIConfigSchema.parse(config);
    this.googleOAuth = new GoogleOAuthSdk({
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      redirectUri: this.config.redirectUri,
      scopes: [
        'https://www.googleapis.com/auth/yt-analytics.readonly',
        'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
      ],
    });
  }

  private async getAccessToken(): Promise<string> {
    if (!this.config.accessToken) {
      throw new Error('Access token is not set');
    }

    try {
      const validationResult = await this.googleOAuth.validateAccessToken(this.config.accessToken);
      if (!validationResult.isValid) {
        if (this.config.refreshToken) {
          const { accessToken } = await this.googleOAuth.refreshAccessToken(this.config.refreshToken);
          this.config.accessToken = accessToken;
        } else {
          throw new Error('Access token is invalid and no refresh token is available');
        }
      }
    } catch (error) {
      throw new Error(`Failed to validate or refresh access token: ${error}`);
    }

    return this.config.accessToken;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const accessToken = await this.getAccessToken();
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${accessToken}`);
    return fetch(url, { ...options, headers });
  }

  async listReportTypes(params: {
    includeSystemManaged?: boolean;
    onBehalfOfContentOwner?: string;
    pageToken?: string;
  } = {}): Promise<z.infer<typeof ListReportTypesResponseSchema>> {
    const url = new URL('https://youtubereporting.googleapis.com/v1/reportTypes');
    if (params.includeSystemManaged !== undefined) {
      url.searchParams.set('includeSystemManaged', params.includeSystemManaged.toString());
    }
    if (params.onBehalfOfContentOwner) {
      url.searchParams.set('onBehalfOfContentOwner', params.onBehalfOfContentOwner);
    }
    if (params.pageToken) {
      url.searchParams.set('pageToken', params.pageToken);
    }

    const response = await this.fetchWithAuth(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to list report types: ${response.statusText}`);
    }

    const data = await response.json();
    return ListReportTypesResponseSchema.parse(data);
  }

  async createJob(job: { name: string; reportTypeId: string }): Promise<z.infer<typeof JobSchema>> {
    const url = 'https://youtubereporting.googleapis.com/v1/jobs';
    const response = await this.fetchWithAuth(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(job),
    });

    if (!response.ok) {
      throw new Error(`Failed to create job: ${response.statusText}`);
    }

    const data = await response.json();
    return JobSchema.parse(data);
  }

  async listJobs(params: {
    includeSystemManaged?: boolean;
    onBehalfOfContentOwner?: string;
    pageToken?: string;
  } = {}): Promise<z.infer<typeof ListJobsResponseSchema>> {
    const url = new URL('https://youtubereporting.googleapis.com/v1/jobs');
    if (params.includeSystemManaged !== undefined) {
      url.searchParams.set('includeSystemManaged', params.includeSystemManaged.toString());
    }
    if (params.onBehalfOfContentOwner) {
      url.searchParams.set('onBehalfOfContentOwner', params.onBehalfOfContentOwner);
    }
    if (params.pageToken) {
      url.searchParams.set('pageToken', params.pageToken);
    }

    const response = await this.fetchWithAuth(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to list jobs: ${response.statusText}`);
    }

    const data = await response.json();
    return ListJobsResponseSchema.parse(data);
  }

  async listReports(jobId: string, params: {
    createdAfter?: string;
    startTimeAtOrAfter?: string;
    startTimeBefore?: string;
    onBehalfOfContentOwner?: string;
    pageToken?: string;
  } = {}): Promise<z.infer<typeof ListReportsResponseSchema>> {
    const url = new URL(`https://youtubereporting.googleapis.com/v1/jobs/${jobId}/reports`);
    if (params.createdAfter) {
      url.searchParams.set('createdAfter', params.createdAfter);
    }
    if (params.startTimeAtOrAfter) {
      url.searchParams.set('startTimeAtOrAfter', params.startTimeAtOrAfter);
    }
    if (params.startTimeBefore) {
      url.searchParams.set('startTimeBefore', params.startTimeBefore);
    }
    if (params.onBehalfOfContentOwner) {
      url.searchParams.set('onBehalfOfContentOwner', params.onBehalfOfContentOwner);
    }
    if (params.pageToken) {
      url.searchParams.set('pageToken', params.pageToken);
    }

    const response = await this.fetchWithAuth(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to list reports: ${response.statusText}`);
    }

    const data = await response.json();
    return ListReportsResponseSchema.parse(data);
  }

  async downloadReport(downloadUrl: string): Promise<string> {
    const response = await this.fetchWithAuth(downloadUrl, {
      headers: {
        'Accept-Encoding': 'gzip',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download report: ${response.statusText}`);
    }

    return response.text();
  }
}

export function createYoutubeReportingAPISDK(config: YouTubeReportingAPIConfig): YouTubeReportingAPISDK {
  return new YouTubeReportingAPISDK(config);
}
