import { z } from 'zod';

export const tokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  scope: z.string(),
  token_type: z.string(),
  refresh_token: z.string().optional(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  error_description: z.string().optional(),
});

// Export inferred types
export type TokenResponse = z.infer<typeof tokenResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
