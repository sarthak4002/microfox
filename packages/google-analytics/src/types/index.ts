import { z } from 'zod';

export interface GoogleAnalyticsConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken: string;
}

export interface Dimension {
  name: string;
}

export interface Metric {
  name: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface FilterExpression {
  // Complex structure - see Google API docs for details
}

export enum MetricAggregation {}
// Enum values - see Google API docs for details

export interface OrderBy {
  // Structure for ordering results - see Google API docs for details
}

export interface CohortSpec {
  // Structure for cohort analysis - see Google API docs for details
}

export interface Comparison {
  // Structure for comparison analysis - see Google API docs for details
}

export interface RunReportRequest {
  dimensions: Dimension[];
  metrics: Metric[];
  dateRanges: DateRange[];
  dimensionFilter?: FilterExpression;
  metricFilter?: FilterExpression;
  offset?: string;
  limit?: string;
  metricAggregations?: MetricAggregation[];
  orderBys?: OrderBy[];
  currencyCode?: string;
  cohortSpec?: CohortSpec;
  keepEmptyRows?: boolean;
  returnPropertyQuota?: boolean;
  comparisons?: Comparison[];
}

export interface DimensionHeader {
  name: string;
}

export interface MetricHeader {
  name: string;
  type: MetricType;
}

export interface Row {
  dimensionValues: DimensionValue[];
  metricValues: MetricValue[];
}

export interface DimensionValue {
  value: string;
}

export interface MetricValue {
  value: string;
}

export interface ResponseMetaData {
  // Metadata about the response - see Google API docs for details
}

export enum MetricType {}
// Enum values - see Google API docs for details

export interface RunReportResponse {
  dimensionHeaders: DimensionHeader[];
  metricHeaders: MetricHeader[];
  rows: Row[];
  rowCount: number;
  metadata: ResponseMetaData;
}

export interface BatchRunReportsRequest {
  requests: RunReportRequest[];
}

export interface BatchRunReportsResponse {
  reports: RunReportResponse[];
}

export interface RunPivotReportRequest {
  // Similar to RunReportRequest with additional pivot-specific fields
}

export interface RunPivotReportResponse {
  // Similar to RunReportResponse with additional pivot-specific fields
}

export interface BatchRunPivotReportsRequest {
  requests: RunPivotReportRequest[];
}

export interface BatchRunPivotReportsResponse {
  pivotReports: RunPivotReportResponse[];
}

export interface Metadata {
  // Metadata structure - see Google API docs for details
}

export interface CheckCompatibilityRequest {
  // Compatibility check request structure - see Google API docs for details
}

export interface CheckCompatibilityResponse {
  // Compatibility check response structure - see Google API docs for details
}

export interface RunRealtimeReportRequest {
  // Realtime report request structure - see Google API docs for details
}

export interface RunRealtimeReportResponse {
  // Realtime report response structure - see Google API docs for details
}

export interface CreateAudienceExportRequest {
  // Audience export creation request structure - see Google API docs for details
}

export interface AudienceExport {
  // Audience export structure - see Google API docs for details
}

export interface ListAudienceExportsResponse {
  audienceExports: AudienceExport[];
  nextPageToken?: string;
}

export interface RunFunnelReportRequest {
  // Funnel report request structure - see Google API docs for details
}

export interface RunFunnelReportResponse {
  // Funnel report response structure - see Google API docs for details
}

export interface PropertyQuotasSnapshot {
  // Property quotas snapshot structure - see Google API docs for details
}

export interface CreateAudienceListRequest {
  // Audience list creation request structure - see Google API docs for details
}

export interface AudienceList {
  // Audience list structure - see Google API docs for details
}

export interface ListAudienceListsResponse {
  audienceLists: AudienceList[];
  nextPageToken?: string;
}

export interface CreateRecurringAudienceListRequest {
  // Recurring audience list creation request structure - see Google API docs for details
}

export interface RecurringAudienceList {
  // Recurring audience list structure - see Google API docs for details
}

export interface ListRecurringAudienceListsResponse {
  recurringAudienceLists: RecurringAudienceList[];
  nextPageToken?: string;
}

export interface CreateReportTaskRequest {
  // Report task creation request structure - see Google API docs for details
}

export interface ReportTask {
  // Report task structure - see Google API docs for details
}

export interface ListReportTasksResponse {
  reportTasks: ReportTask[];
  nextPageToken?: string;
}
