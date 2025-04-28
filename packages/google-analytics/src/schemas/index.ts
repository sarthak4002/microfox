import { z } from 'zod';

export const googleAnalyticsConfigSchema = z.object({
  clientId: z.string().min(1).describe('The client ID for Google OAuth'),
  clientSecret: z
    .string()
    .min(1)
    .describe('The client secret for Google OAuth'),
  redirectUri: z.string().url().describe('The redirect URI for Google OAuth'),
  accessToken: z
    .string()
    .min(1)
    .describe('The access token for Google Analytics API'),
});

export const dimensionSchema = z.object({
  name: z.string().min(1).describe('The name of the dimension'),
});

export const metricSchema = z.object({
  name: z.string().min(1).describe('The name of the metric'),
});

export const dateRangeSchema = z.object({
  startDate: z.string().min(1).describe('The start date of the date range'),
  endDate: z.string().min(1).describe('The end date of the date range'),
});

export const filterExpressionSchema = z
  .any()
  .describe('Complex structure for filter expressions');

export const metricAggregationSchema = z
  .enum([])
  .describe('Enum for metric aggregations');

export const orderBySchema = z.any().describe('Structure for ordering results');

export const cohortSpecSchema = z
  .any()
  .describe('Structure for cohort analysis');

export const comparisonSchema = z
  .any()
  .describe('Structure for comparison analysis');

export const runReportRequestSchema = z.object({
  dimensions: z
    .array(dimensionSchema)
    .describe('The dimensions for the report'),
  metrics: z.array(metricSchema).describe('The metrics for the report'),
  dateRanges: z
    .array(dateRangeSchema)
    .describe('The date ranges for the report'),
  dimensionFilter: filterExpressionSchema
    .optional()
    .describe('The dimension filter for the report'),
  metricFilter: filterExpressionSchema
    .optional()
    .describe('The metric filter for the report'),
  offset: z.string().optional().describe('The offset for pagination'),
  limit: z.string().optional().describe('The limit for pagination'),
  metricAggregations: z
    .array(metricAggregationSchema)
    .optional()
    .describe('The metric aggregations for the report'),
  orderBys: z
    .array(orderBySchema)
    .optional()
    .describe('The order by clauses for the report'),
  currencyCode: z
    .string()
    .optional()
    .describe('The currency code for the report'),
  cohortSpec: cohortSpecSchema
    .optional()
    .describe('The cohort specification for the report'),
  keepEmptyRows: z
    .boolean()
    .optional()
    .describe('Whether to keep empty rows in the report'),
  returnPropertyQuota: z
    .boolean()
    .optional()
    .describe('Whether to return property quota information'),
  comparisons: z
    .array(comparisonSchema)
    .optional()
    .describe('The comparisons for the report'),
});

export const batchRunReportsRequestSchema = z.object({
  requests: z
    .array(runReportRequestSchema)
    .describe('The report requests for batch processing'),
});

export const runPivotReportRequestSchema = z
  .any()
  .describe('Schema for pivot report requests');

export const batchRunPivotReportsRequestSchema = z.object({
  requests: z
    .array(runPivotReportRequestSchema)
    .describe('The pivot report requests for batch processing'),
});

export const checkCompatibilityRequestSchema = z
  .any()
  .describe('Schema for compatibility check requests');

export const runRealtimeReportRequestSchema = z
  .any()
  .describe('Schema for realtime report requests');

export const createAudienceExportRequestSchema = z
  .any()
  .describe('Schema for audience export creation requests');

export const runFunnelReportRequestSchema = z
  .any()
  .describe('Schema for funnel report requests');

export const createAudienceListRequestSchema = z
  .any()
  .describe('Schema for audience list creation requests');

export const createRecurringAudienceListRequestSchema = z
  .any()
  .describe('Schema for recurring audience list creation requests');

export const createReportTaskRequestSchema = z
  .any()
  .describe('Schema for report task creation requests');
