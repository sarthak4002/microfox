import { z } from 'zod';

export const YouTubeReportingAPIConfigSchema = z.object({
  clientId: z.string().min(1).describe('The client ID for the Google OAuth 2.0 credentials'),
  clientSecret: z.string().min(1).describe('The client secret for the Google OAuth 2.0 credentials'),
  redirectUri: z.string().url().describe('The redirect URI for the Google OAuth 2.0 flow'),
  accessToken: z.string().optional().describe('The access token for authenticated requests'),
  refreshToken: z.string().optional().describe('The refresh token to obtain new access tokens'),
});

export const ReportTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  systemManaged: z.boolean().optional(),
});

export const ListReportTypesResponseSchema = z.object({
  reportTypes: z.array(ReportTypeSchema),
  nextPageToken: z.string().optional(),
});

export const JobSchema = z.object({
  id: z.string(),
  name: z.string(),
  reportTypeId: z.string(),
  createTime: z.string(),
});

export const ListJobsResponseSchema = z.object({
  jobs: z.array(JobSchema),
  nextPageToken: z.string().optional(),
});

export const ReportSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  createTime: z.string(),
  downloadUrl: z.string().optional(),
});

export const ListReportsResponseSchema = z.object({
  reports: z.array(ReportSchema),
  nextPageToken: z.string().optional(),
});
