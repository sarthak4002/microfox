import { z } from 'zod';
import { GoogleScope } from '../types';

export const googleAuthConfigSchema = z.object({
  clientId: z.string().nonempty('Client ID is required'),
  clientSecret: z.string().nonempty('Client Secret is required'),
  redirectUri: z.string().url('Invalid redirect URI'),
  scopes: z.array(z.nativeEnum(GoogleScope)).optional(),
  state: z.string().optional(),
});

export const tokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  scope: z.string(),
  id_token: z.string().optional(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  error_description: z.string().optional(),
});

export type TokenResponse = z.infer<typeof tokenResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
