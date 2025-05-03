import { z } from 'zod';
import {
  reportQueryParamsSchema,
  reportResponseSchema,
  groupSchema,
  groupListResponseSchema,
  groupItemSchema,
  groupItemListResponseSchema,
} from '../schemas';

export type ReportQueryParams = z.infer<typeof reportQueryParamsSchema>;
export type ReportResponse = z.infer<typeof reportResponseSchema>;
export type Group = z.infer<typeof groupSchema>;
export type GroupListResponse = z.infer<typeof groupListResponseSchema>;
export type GroupItem = z.infer<typeof groupItemSchema>;
export type GroupItemListResponse = z.infer<typeof groupItemListResponseSchema>;

export interface YouTubeAnalyticsAPISDKParams {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken: string;
}
