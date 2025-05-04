import { z } from 'zod';

export const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD');
export type Date = z.infer<typeof DateSchema>;

export const IdSchema = z.string().min(1, 'ID must not be empty');
export type Id = z.infer<typeof IdSchema>;

export const MetricsSchema = z.string().min(1, 'Metrics must not be empty');
export type Metrics = z.infer<typeof MetricsSchema>;

export const CurrencySchema = z.string().length(3, 'Currency must be a 3-letter ISO 4217 code');
export type Currency = z.infer<typeof CurrencySchema>;

export const DimensionsSchema = z.string().optional();
export type Dimensions = z.infer<typeof DimensionsSchema>;

export const FiltersSchema = z.string().optional();
export type Filters = z.infer<typeof FiltersSchema>;

export const BooleanSchema = z.boolean().optional();
export type OptionalBoolean = z.infer<typeof BooleanSchema>;

export const IntegerSchema = z.number().int().optional();
export type OptionalInteger = z.infer<typeof IntegerSchema>;

export const SortSchema = z.string().optional();
export type Sort = z.infer<typeof SortSchema>;

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
});
export type ReportsQueryParams = z.infer<typeof ReportsQueryParamsSchema>;

export const GroupListParamsSchema = z.object({
  id: z.string().optional(),
  mine: z.boolean().optional(),
  onBehalfOfContentOwner: z.string().optional(),
  pageToken: z.string().optional(),
});
export type GroupListParams = z.infer<typeof GroupListParamsSchema>;

export const GroupInsertParamsSchema = z.object({
  onBehalfOfContentOwner: z.string().optional(),
});
export type GroupInsertParams = z.infer<typeof GroupInsertParamsSchema>;

export const GroupUpdateParamsSchema = z.object({
  onBehalfOfContentOwner: z.string().optional(),
});
export type GroupUpdateParams = z.infer<typeof GroupUpdateParamsSchema>;

export const GroupDeleteParamsSchema = z.object({
  id: IdSchema,
  onBehalfOfContentOwner: z.string().optional(),
});
export type GroupDeleteParams = z.infer<typeof GroupDeleteParamsSchema>;

export const GroupItemsListParamsSchema = z.object({
  groupId: IdSchema,
  onBehalfOfContentOwner: z.string().optional(),
});
export type GroupItemsListParams = z.infer<typeof GroupItemsListParamsSchema>;

export const GroupItemsInsertParamsSchema = z.object({
  onBehalfOfContentOwner: z.string().optional(),
});
export type GroupItemsInsertParams = z.infer<typeof GroupItemsInsertParamsSchema>;

export const GroupItemsDeleteParamsSchema = z.object({
  id: IdSchema,
  onBehalfOfContentOwner: z.string().optional(),
});
export type GroupItemsDeleteParams = z.infer<typeof GroupItemsDeleteParamsSchema>;

export interface ResultTable {
  kind: "youtubeAnalytics#resultTable";
  columnHeaders: Array<{
    name: string;
    dataType: string;
    columnType: string;
  }>;
  rows: Array<Array<string | number | boolean>>;
}

export interface ReportsQueryResponse {
  result: ResultTable;
}

export interface Group {
  kind: "youtube#group";
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    title: string;
  };
  contentDetails: {
    itemCount: number;
    itemType: "youtube#channel" | "youtube#playlist" | "youtube#video" | "youtubePartner#asset";
  };
}

export interface GroupListResponse {
  kind: "youtube#groupListResponse";
  etag: string;
  items: Group[];
  nextPageToken?: string;
}

export interface GroupItem {
  kind: "youtube#groupItem";
  etag: string;
  id: string;
  groupId: string;
  resource: {
    kind: string;
    id: string;
  };
}

export interface GroupItemListResponse {
  kind: "youtube#groupItemListResponse";
  etag: string;
  items: GroupItem[];
}

export interface YoutubeAnalyticsSDKParams {
  accessToken: string;
  refreshToken?: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}
