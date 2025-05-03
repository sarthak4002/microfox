import { z } from 'zod';

export const reportQueryParamsSchema = z.object({
  ids: z.string().describe('Identifies the channel or content owner'),
  startDate: z.string().describe('Start date for the report (YYYY-MM-DD)'),
  endDate: z.string().describe('End date for the report (YYYY-MM-DD)'),
  metrics: z.string().describe('Comma-separated list of metrics'),
  dimensions: z.string().optional().describe('Comma-separated list of dimensions'),
  filters: z.string().optional().describe('Filtering criteria'),
  sort: z.string().optional().describe('Comma-separated list of dimensions or metrics to sort by'),
  maxResults: z.number().int().optional().describe('Maximum number of rows to return'),
  startIndex: z.number().int().optional().describe('Index of the first row to return'),
  currency: z.string().optional().describe('Currency for monetary reports (ISO 4217 currency code)'),
  includeHistoricalChannelData: z.boolean().optional().describe('Include historical data for channel'),
});

export const reportResponseSchema = z.object({
  kind: z.literal('youtubeAnalytics#report'),
  columnHeaders: z.array(z.object({
    name: z.string(),
    columnType: z.string(),
    dataType: z.string(),
  })),
  rows: z.array(z.array(z.any())),
});

export const groupSchema = z.object({
  kind: z.literal('youtubeAnalytics#group'),
  id: z.string(),
  snippet: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
  contentDetails: z.object({
    itemType: z.string(),
    itemCount: z.number().optional(),
  }),
});

export const groupListResponseSchema = z.object({
  kind: z.literal('youtubeAnalytics#groupListResponse'),
  items: z.array(groupSchema),
  nextPageToken: z.string().optional(),
});

export const groupItemSchema = z.object({
  kind: z.literal('youtubeAnalytics#groupItem'),
  id: z.string(),
  groupId: z.string(),
  resource: z.object({
    kind: z.string(),
    id: z.string(),
  }),
});

export const groupItemListResponseSchema = z.object({
  kind: z.literal('youtubeAnalytics#groupItemListResponse'),
  items: z.array(groupItemSchema),
  nextPageToken: z.string().optional(),
});
