import { z } from 'zod';
import {
  reportQueryParamsSchema,
  groupListParamsSchema,
  groupSchema,
  groupItemListParamsSchema,
  groupItemSchema,
} from '../schemas';

export type ReportQueryParams = z.infer<typeof reportQueryParamsSchema>;

export interface ReportResponse {
  kind: 'youtubeAnalytics#resultTable';
  columnHeaders: Array<{
    name: string;
    dataType: string;
    columnType: string;
  }>;
  rows?: Array<Array<string | number>>;
}

export type GroupListParams = z.infer<typeof groupListParamsSchema>;

export interface GroupListResponse {
  kind: 'youtube#groupListResponse';
  etag: string;
  items: Array<Group>;
  nextPageToken?: string;
}

export type Group = z.infer<typeof groupSchema>;

export type GroupItemListParams = z.infer<typeof groupItemListParamsSchema>;

export interface GroupItemListResponse {
  kind: 'youtube#groupItemListResponse';
  etag: string;
  items: Array<GroupItem>;
}

export type GroupItem = z.infer<typeof groupItemSchema>;
