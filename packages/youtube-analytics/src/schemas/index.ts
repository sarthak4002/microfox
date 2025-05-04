import { z } from 'zod';

export const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD').describe('Date in YYYY-MM-DD format');

export const IdSchema = z.string().min(1, 'ID must not be empty').describe('Non-empty string ID');

export const MetricsSchema = z.string().min(1, 'Metrics must not be empty').describe('Comma-separated list of metrics');

export const CurrencySchema = z.string().length(3, 'Currency must be a 3-letter ISO 4217 code').describe('Three-letter ISO 4217 currency code');

export const DimensionsSchema = z.string().optional().describe('Optional comma-separated list of dimensions');

export const FiltersSchema = z.string().optional().describe('Optional filters for data');

export const BooleanSchema = z.boolean().optional().describe('Optional boolean value');

export const IntegerSchema = z.number().int().optional().describe('Optional integer value');

export const SortSchema = z.string().optional().describe('Optional sorting criteria');

export const ReportsQueryParamsSchema = z.object({
  endDate: DateSchema,
  ids: IdSchema,
  metrics: MetricsSchema,
  startDate: DateSchema,
  currency: CurrencySchema.optional(),
  dimensions: DimensionsSchema,
  filters: FiltersSchema,
  includeHistoricalChannelData: BooleanSchema,
  maxResults: IntegerSchema,
  sort: SortSchema,
  startIndex: IntegerSchema,
}).describe('Parameters for querying YouTube Analytics reports');

export const GroupListParamsSchema = z.object({
  id: z.string().optional().describe('Optional comma-separated list of group IDs'),
  mine: z.boolean().optional().describe('Set to true to retrieve all groups owned by the authenticated user'),
  onBehalfOfContentOwner: z.string().optional().describe('Optional content owner ID'),
  pageToken: z.string().optional().describe('Optional token for pagination'),
}).describe('Parameters for listing YouTube Analytics groups');

export const GroupInsertParamsSchema = z.object({
  onBehalfOfContentOwner: z.string().optional().describe('Optional content owner ID'),
}).describe('Parameters for inserting a YouTube Analytics group');

export const GroupUpdateParamsSchema = z.object({
  onBehalfOfContentOwner: z.string().optional().describe('Optional content owner ID'),
}).describe('Parameters for updating a YouTube Analytics group');

export const GroupDeleteParamsSchema = z.object({
  id: IdSchema,
  onBehalfOfContentOwner: z.string().optional().describe('Optional content owner ID'),
}).describe('Parameters for deleting a YouTube Analytics group');

export const GroupItemsListParamsSchema = z.object({
  groupId: IdSchema,
  onBehalfOfContentOwner: z.string().optional().describe('Optional content owner ID'),
}).describe('Parameters for listing YouTube Analytics group items');

export const GroupItemsInsertParamsSchema = z.object({
  onBehalfOfContentOwner: z.string().optional().describe('Optional content owner ID'),
}).describe('Parameters for inserting a YouTube Analytics group item');

export const GroupItemsDeleteParamsSchema = z.object({
  id: IdSchema,
  onBehalfOfContentOwner: z.string().optional().describe('Optional content owner ID'),
}).describe('Parameters for deleting a YouTube Analytics group item');

export const YoutubeAnalyticsSDKParamsSchema = z.object({
  accessToken: z.string().describe('OAuth 2.0 access token'),
  refreshToken: z.string().optional().describe('Optional OAuth 2.0 refresh token'),
  clientId: z.string().describe('OAuth 2.0 client ID'),
  clientSecret: z.string().describe('OAuth 2.0 client secret'),
  redirectUri: z.string().describe('OAuth 2.0 redirect URI'),
}).describe('Parameters for initializing the YouTube Analytics SDK');

export const RefreshTokenResponseSchema = z.object({
  accessToken: z.string().describe('New OAuth 2.0 access token'),
  expiresIn: z.number().describe('Token expiration time in seconds'),
}).describe('Response from refreshing an OAuth 2.0 token');
