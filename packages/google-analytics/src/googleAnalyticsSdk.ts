import { GoogleOAuthSdk, GoogleScope } from '@microfox/google-oauth';
import { z } from 'zod';
import {
  GoogleAnalyticsConfig,
  RunReportRequest,
  RunReportResponse,
  BatchRunReportsRequest,
  BatchRunReportsResponse,
  RunPivotReportRequest,
  RunPivotReportResponse,
  BatchRunPivotReportsRequest,
  BatchRunPivotReportsResponse,
  Metadata,
  CheckCompatibilityRequest,
  CheckCompatibilityResponse,
  RunRealtimeReportRequest,
  RunRealtimeReportResponse,
  CreateAudienceExportRequest,
  AudienceExport,
  ListAudienceExportsResponse,
  RunFunnelReportRequest,
  RunFunnelReportResponse,
  PropertyQuotasSnapshot,
  CreateAudienceListRequest,
  AudienceList,
  ListAudienceListsResponse,
  CreateRecurringAudienceListRequest,
  RecurringAudienceList,
  ListRecurringAudienceListsResponse,
  CreateReportTaskRequest,
  ReportTask,
  ListReportTasksResponse,
} from './types';
import {
  googleAnalyticsConfigSchema,
  runReportRequestSchema,
  batchRunReportsRequestSchema,
  runPivotReportRequestSchema,
  batchRunPivotReportsRequestSchema,
  checkCompatibilityRequestSchema,
  runRealtimeReportRequestSchema,
  createAudienceExportRequestSchema,
  runFunnelReportRequestSchema,
  createAudienceListRequestSchema,
  createRecurringAudienceListRequestSchema,
  createReportTaskRequestSchema,
} from './schemas';

export class GoogleAnalyticsSDK {
  private readonly oauthSdk: GoogleOAuthSdk;
  private readonly baseUrl = 'https://analyticsdata.googleapis.com';
  private accessToken: string;

  constructor(config: GoogleAnalyticsConfig) {
    const validatedConfig = googleAnalyticsConfigSchema.parse(config);
    this.oauthSdk = new GoogleOAuthSdk({
      clientId: validatedConfig.clientId,
      clientSecret: validatedConfig.clientSecret,
      redirectUri: validatedConfig.redirectUri,
      scopes: [GoogleScope.ANALYTICS, GoogleScope.ANALYTICS_READONLY],
    });
    this.accessToken = validatedConfig.accessToken;
  }

  private async ensureValidAccessToken(): Promise<void> {
    try {
      const isValid = await this.oauthSdk.validateAccessToken(this.accessToken);
      if (!isValid) {
        throw new Error('Invalid access token');
      }
    } catch (error: any) {
      throw new Error(`Failed to validate access token: ${error.message}`);
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    method: string,
    body?: any,
  ): Promise<T> {
    await this.ensureValidAccessToken();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async runReport(
    property: string,
    request: RunReportRequest,
  ): Promise<RunReportResponse> {
    const validatedRequest = runReportRequestSchema.parse(request);
    return this.makeRequest<RunReportResponse>(
      `/v1beta/${property}:runReport`,
      'POST',
      validatedRequest,
    );
  }

  async batchRunReports(
    property: string,
    request: BatchRunReportsRequest,
  ): Promise<BatchRunReportsResponse> {
    const validatedRequest = batchRunReportsRequestSchema.parse(request);
    return this.makeRequest<BatchRunReportsResponse>(
      `/v1beta/${property}:batchRunReports`,
      'POST',
      validatedRequest,
    );
  }

  async runPivotReport(
    property: string,
    request: RunPivotReportRequest,
  ): Promise<RunPivotReportResponse> {
    const validatedRequest = runPivotReportRequestSchema.parse(request);
    return this.makeRequest<RunPivotReportResponse>(
      `/v1beta/${property}:runPivotReport`,
      'POST',
      validatedRequest,
    );
  }

  async batchRunPivotReports(
    property: string,
    request: BatchRunPivotReportsRequest,
  ): Promise<BatchRunPivotReportsResponse> {
    const validatedRequest = batchRunPivotReportsRequestSchema.parse(request);
    return this.makeRequest<BatchRunPivotReportsResponse>(
      `/v1beta/${property}:batchRunPivotReports`,
      'POST',
      validatedRequest,
    );
  }

  async getMetadata(name: string): Promise<Metadata> {
    return this.makeRequest<Metadata>(`/v1beta/${name}`, 'GET');
  }

  async checkCompatibility(
    property: string,
    request: CheckCompatibilityRequest,
  ): Promise<CheckCompatibilityResponse> {
    const validatedRequest = checkCompatibilityRequestSchema.parse(request);
    return this.makeRequest<CheckCompatibilityResponse>(
      `/v1beta/${property}:checkCompatibility`,
      'POST',
      validatedRequest,
    );
  }

  async runRealtimeReport(
    property: string,
    request: RunRealtimeReportRequest,
  ): Promise<RunRealtimeReportResponse> {
    const validatedRequest = runRealtimeReportRequestSchema.parse(request);
    return this.makeRequest<RunRealtimeReportResponse>(
      `/v1beta/${property}:runRealtimeReport`,
      'POST',
      validatedRequest,
    );
  }

  async createAudienceExport(
    parent: string,
    request: CreateAudienceExportRequest,
  ): Promise<AudienceExport> {
    const validatedRequest = createAudienceExportRequestSchema.parse(request);
    return this.makeRequest<AudienceExport>(
      `/v1beta/${parent}/audienceExports`,
      'POST',
      validatedRequest,
    );
  }

  async getAudienceExport(name: string): Promise<AudienceExport> {
    return this.makeRequest<AudienceExport>(`/v1beta/${name}`, 'GET');
  }

  async listAudienceExports(
    parent: string,
  ): Promise<ListAudienceExportsResponse> {
    return this.makeRequest<ListAudienceExportsResponse>(
      `/v1beta/${parent}/audienceExports`,
      'GET',
    );
  }

  async runFunnelReport(
    property: string,
    request: RunFunnelReportRequest,
  ): Promise<RunFunnelReportResponse> {
    const validatedRequest = runFunnelReportRequestSchema.parse(request);
    return this.makeRequest<RunFunnelReportResponse>(
      `/v1alpha/${property}:runFunnelReport`,
      'POST',
      validatedRequest,
    );
  }

  async getPropertyQuotasSnapshot(
    name: string,
  ): Promise<PropertyQuotasSnapshot> {
    return this.makeRequest<PropertyQuotasSnapshot>(`/v1alpha/${name}`, 'GET');
  }

  async createAudienceList(
    parent: string,
    request: CreateAudienceListRequest,
  ): Promise<AudienceList> {
    const validatedRequest = createAudienceListRequestSchema.parse(request);
    return this.makeRequest<AudienceList>(
      `/v1alpha/${parent}/audienceLists`,
      'POST',
      validatedRequest,
    );
  }

  async getAudienceList(name: string): Promise<AudienceList> {
    return this.makeRequest<AudienceList>(`/v1alpha/${name}`, 'GET');
  }

  async listAudienceLists(parent: string): Promise<ListAudienceListsResponse> {
    return this.makeRequest<ListAudienceListsResponse>(
      `/v1alpha/${parent}/audienceLists`,
      'GET',
    );
  }

  async createRecurringAudienceList(
    parent: string,
    request: CreateRecurringAudienceListRequest,
  ): Promise<RecurringAudienceList> {
    const validatedRequest =
      createRecurringAudienceListRequestSchema.parse(request);
    return this.makeRequest<RecurringAudienceList>(
      `/v1alpha/${parent}/recurringAudienceLists`,
      'POST',
      validatedRequest,
    );
  }

  async getRecurringAudienceList(name: string): Promise<RecurringAudienceList> {
    return this.makeRequest<RecurringAudienceList>(`/v1alpha/${name}`, 'GET');
  }

  async listRecurringAudienceLists(
    parent: string,
  ): Promise<ListRecurringAudienceListsResponse> {
    return this.makeRequest<ListRecurringAudienceListsResponse>(
      `/v1alpha/${parent}/recurringAudienceLists`,
      'GET',
    );
  }

  async createReportTask(
    parent: string,
    request: CreateReportTaskRequest,
  ): Promise<ReportTask> {
    const validatedRequest = createReportTaskRequestSchema.parse(request);
    return this.makeRequest<ReportTask>(
      `/v1alpha/${parent}/reportTasks`,
      'POST',
      validatedRequest,
    );
  }

  async getReportTask(name: string): Promise<ReportTask> {
    return this.makeRequest<ReportTask>(`/v1alpha/${name}`, 'GET');
  }

  async listReportTasks(parent: string): Promise<ListReportTasksResponse> {
    return this.makeRequest<ListReportTasksResponse>(
      `/v1alpha/${parent}/reportTasks`,
      'GET',
    );
  }

  async refreshAccessToken(refreshToken: string): Promise<void> {
    try {
      const { accessToken } =
        await this.oauthSdk.refreshAccessToken(refreshToken);
      this.accessToken = accessToken;
    } catch (error: any) {
      throw new Error(`Failed to refresh access token: ${error.message}`);
    }
  }
}

export function createGoogleAnalyticsSDK(
  config: GoogleAnalyticsConfig,
): GoogleAnalyticsSDK {
  return new GoogleAnalyticsSDK(config);
}
