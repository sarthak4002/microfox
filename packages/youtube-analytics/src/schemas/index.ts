import { z } from 'zod';

export const reportQueryParamsSchema = z.object({
  ids: z.string().describe('Channel or content owner ID'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Start date in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('End date in YYYY-MM-DD format'),
  metrics: z.string().describe('Comma-separated list of metrics'),
  currency: z.string().length(3).optional().describe('Three-letter ISO 4217 currency code'),
  dimensions: z.string().optional().describe('Comma-separated list of dimensions'),
  filters: z.string().optional().describe('Filtering criteria'),
  includeHistoricalChannelData: z.boolean().optional().describe('Include data prior to channel linking for content owner reports'),
  maxResults: z.number().int().positive().optional().describe('Maximum number of rows to return'),
  sort: z.string().optional().describe('Comma-separated list of dimensions or metrics for sorting'),
  startIndex: z.number().int().positive().optional().describe('1-based index of the first row to retrieve'),
});

export const groupListParamsSchema = z.object({
  id: z.string().optional().describe('Comma-separated list of group IDs'),
  mine: z.boolean().optional().describe('Set to true to retrieve all groups owned by the authenticated user'),
  onBehalfOfContentOwner: z.string().optional().describe('Content owner ID for requests on behalf of a content owner'),
  pageToken: z.string().optional().describe('Pagination token for retrieving next page of results'),
});

export const groupSchema = z.object({
  kind: z.literal('youtube#group'),
  etag: z.string(),
  id: z.string(),
  snippet: z.object({
    publishedAt: z.string(),
    title: z.string(),
  }),
  contentDetails: z.object({
    itemCount: z.number(),
    itemType: z.enum(['youtube#channel', 'youtube#playlist', 'youtube#video', 'youtubePartner#asset']),
  }),
});

export const groupItemListParamsSchema = z.object({
  groupId: z.string().describe('Group ID'),
  onBehalfOfContentOwner: z.string().optional().describe('Content owner ID'),
});

export const groupItemSchema = z.object({
  kind: z.literal('youtube#groupItem'),
  etag: z.string(),
  id: z.string().describe('Group item ID'),
  groupId: z.string(),
  resource: z.object({
    kind: z.enum(['youtube#channel', 'youtube#playlist', 'youtube#video', 'youtubePartner#asset']),
    id: z.string().describe('Resource ID'),
  }),
});
