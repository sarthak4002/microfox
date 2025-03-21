import { z } from 'zod';
const TOKEN_INFO_URL = 'https://oauth2.googleapis.com/tokeninfo';
const TOKEN_REFRESH_URL = 'https://oauth2.googleapis.com/token';
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

// Zod schemas for validation
export const TokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.string().optional(),
  scope: z.string().optional(),
  refresh_token: z.string().optional(),
});

export const TokenInfoSchema = z.object({
  exp: z.string().optional(), // Expiration time
  azp: z.string().optional(),
  aud: z.string().optional(),
  scope: z.string().optional(),
  email: z.string().optional(),
  error_description: z.string().optional(),
});

export const TokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.number().optional(), // Timestamp when the token expires
  tokenType: z.string().optional(),
  isValid: z.boolean(), // Whether the token is valid
  accessTokenStatus: z.enum(['valid', 'expired', 'invalid']),
  refreshTokenStatus: z
    .enum(['valid', 'expired', 'invalid', 'not_provided'])
    .optional(),
  errorMessage: z.string().optional(),
});

// Types derived from Zod schemas
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
export type TokenInfo = z.infer<typeof TokenInfoSchema>;
export type Tokens = z.infer<typeof TokensSchema>;

export const GoogleOAuthOptionsSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  scopes: z.array(z.string()).optional(),
});

export type GoogleOAuthOptions = z.infer<typeof GoogleOAuthOptionsSchema>;

export const AuthUrlOptionsSchema = z.object({
  clientId: z.string(),
  redirectUri: z.string(),
  scopes: z.array(z.string()),
  accessType: z.enum(['online', 'offline']).optional(),
  prompt: z.enum(['none', 'consent', 'select_account']).optional(),
  state: z.string().optional(),
});

export type AuthUrlOptions = z.infer<typeof AuthUrlOptionsSchema>;

export const CodeExchangeOptionsSchema = z.object({
  code: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string(),
});

export type CodeExchangeOptions = z.infer<typeof CodeExchangeOptionsSchema>;

/**
 * Generates an authorization URL for OAuth 2.0 authentication with Google
 */
export const generateAuthUrl = (options: AuthUrlOptions): string => {
  const parsedOptions = AuthUrlOptionsSchema.parse(options);

  const authUrl = new URL(AUTH_URL);
  authUrl.searchParams.append('client_id', parsedOptions.clientId);
  authUrl.searchParams.append('redirect_uri', parsedOptions.redirectUri);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', parsedOptions.scopes.join(' '));
  authUrl.searchParams.append(
    'access_type',
    parsedOptions.accessType || 'offline',
  );
  authUrl.searchParams.append('prompt', parsedOptions.prompt || 'consent');

  if (parsedOptions.state) {
    authUrl.searchParams.append('state', parsedOptions.state);
  }

  return authUrl.toString();
};

/**
 * Exchanges an authorization code for access and refresh tokens
 */
export const exchangeCodeForTokens = async (
  options: CodeExchangeOptions,
): Promise<TokenResponse> => {
  const parsedOptions = CodeExchangeOptionsSchema.parse(options);

  const params = new URLSearchParams({
    code: parsedOptions.code,
    client_id: parsedOptions.clientId,
    client_secret: parsedOptions.clientSecret,
    redirect_uri: parsedOptions.redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error_description || 'Failed to exchange code for tokens',
    );
  }

  const data = await response.json();
  const result = TokenResponseSchema.safeParse(data);

  if (!result.success) {
    throw new Error('Invalid token response format');
  }

  return result.data;
};

/**
 * Checks if an access token is valid by querying the Google tokeninfo endpoint
 * @returns Object containing validation status and error details if applicable
 */
export const checkTokenValidity = async (
  accessToken: string,
): Promise<{
  isValid: boolean;
  status: 'valid' | 'expired' | 'invalid';
  errorMessage?: string;
}> => {
  try {
    const response = await fetch(
      `${TOKEN_INFO_URL}?access_token=${accessToken}`,
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Status code 400 with error_description containing "expired" indicates expired token
      if (
        response.status === 400 &&
        errorData.error_description?.toLowerCase().includes('expired')
      ) {
        return {
          isValid: false,
          status: 'expired',
          errorMessage: errorData.error_description,
        };
      }
      // Other error responses indicate invalid token
      return {
        isValid: false,
        status: 'invalid',
        errorMessage: errorData.error_description || 'Invalid token',
      };
    }

    const data = await response.json();
    const result = TokenInfoSchema.safeParse(data);

    if (!result.success) {
      return {
        isValid: false,
        status: 'invalid',
        errorMessage: 'Invalid token info format',
      };
    }

    return { isValid: true, status: 'valid' };
  } catch (error) {
    console.error('Error validating token:', error);
    return {
      isValid: false,
      status: 'invalid',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Attempts to verify a refresh token by checking if it can be used to get a new access token
 */
export const checkRefreshTokenValidity = async (
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<{
  isValid: boolean;
  status: 'valid' | 'expired' | 'invalid';
  errorMessage?: string;
}> => {
  try {
    // Attempt to refresh the token - if successful, the refresh token is valid
    const result = await refreshAccessToken(
      refreshToken,
      clientId,
      clientSecret,
    );

    if (result) {
      return { isValid: true, status: 'valid' };
    }

    // If refresh fails, assume the refresh token is invalid or expired
    return {
      isValid: false,
      status: 'invalid',
      errorMessage: 'Refresh token is invalid or expired',
    };
  } catch (error) {
    console.error('Error checking refresh token:', error);
    return {
      isValid: false,
      status: 'invalid',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Refreshes an access token using a refresh token
 * Returns a comprehensive token object that can be used by both frontend and backend
 */
export const refreshAccessToken = async (
  refreshToken: string,
  clientId: string,
  clientSecret: string,
  scopes?: string[],
): Promise<Tokens | null> => {
  try {
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    // Add scopes if provided
    if (scopes && scopes.length > 0) {
      params.append('scope', scopes.join(' '));
    }

    const response = await fetch(TOKEN_REFRESH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Refresh token error:', errorData);
      return {
        accessToken: '',
        refreshToken,
        isValid: false,
        accessTokenStatus: 'invalid',
        refreshTokenStatus: 'invalid',
        errorMessage: errorData.error_description || 'Failed to refresh token',
      };
    }

    const data = await response.json();
    const result = TokenResponseSchema.safeParse(data);

    if (!result.success) {
      console.error('Invalid token response format:', data);
      return {
        accessToken: '',
        refreshToken,
        isValid: false,
        accessTokenStatus: 'invalid',
        refreshTokenStatus: 'valid', // Refresh token might still be valid, just got an invalid response
        errorMessage: 'Invalid token response format',
      };
    }

    // Calculate expiration time in milliseconds
    const expiresAt = Date.now() + result.data.expires_in * 1000;

    return {
      accessToken: result.data.access_token,
      refreshToken: result.data.refresh_token || refreshToken, // Some providers return a new refresh token
      expiresAt,
      tokenType: result.data.token_type || 'Bearer',
      isValid: true,
      accessTokenStatus: 'valid',
      refreshTokenStatus: 'valid',
    };
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return {
      accessToken: '',
      refreshToken,
      isValid: false,
      accessTokenStatus: 'invalid',
      refreshTokenStatus: 'invalid',
      errorMessage:
        error instanceof Error
          ? error.message
          : 'Unknown error during token refresh',
    };
  }
};

interface CheckAccessTokenOptions {
  accessToken: string;
  refreshToken: string;
  clientId: string;
  clientSecret: string;
  scopes?: string[];
  expiresAt?: number;
  isValid?: boolean;
}

export const CheckAccessToken = async (
  options: CheckAccessTokenOptions,
): Promise<CheckAccessTokenOptions> => {
  const parsedOptions = GoogleOAuthOptionsSchema.parse(options);
  const { accessToken, refreshToken, clientId, clientSecret, scopes } =
    parsedOptions;
  const accessTokenValidity = await checkTokenValidity(accessToken);
  if (!accessToken) {
    throw new Error('Access Token is required');
  }
  if (accessTokenValidity.isValid) {
    return options;
  }
  if (!clientId || !clientSecret) {
    throw new Error('Client ID and Client Secret are required');
  }
  if (!refreshToken) {
    throw new Error('Refresh Token is required');
  }

  const refreshResult = await refreshAccessToken(
    refreshToken,
    clientId,
    clientSecret,
    scopes,
  );
  if (refreshResult && refreshResult.isValid) {
    return {
      ...options,
      accessToken: refreshResult.accessToken,
      expiresAt: refreshResult.expiresAt,
      isValid: refreshResult.isValid,
    };
  }
  return { ...options, isValid: false };
};

/**
 * Token management wrapper for Google OAuth
 * Checks if the access token is valid, refreshes if needed and possible
 */
export const googleOAuthManager = async (
  options: GoogleOAuthOptions,
): Promise<Tokens> => {
  // Validate options
  const parsedOptions = GoogleOAuthOptionsSchema.parse(options);
  const { accessToken, refreshToken, clientId, clientSecret, scopes } =
    parsedOptions;

  // Check access token validity
  const accessTokenValidity = await checkTokenValidity(accessToken);

  // If token is valid, return it
  if (accessTokenValidity.isValid) {
    return {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + 3600 * 1000, // Assume 1 hour validity if we don't know exact expiry
      tokenType: 'Bearer',
      isValid: true,
      accessTokenStatus: 'valid',
      refreshTokenStatus: refreshToken ? 'valid' : 'not_provided',
    };
  }

  // If token is invalid but we have refresh token and credentials, try to refresh
  if (refreshToken && clientId && clientSecret) {
    // First check if refresh token seems valid
    const refreshResult = await refreshAccessToken(
      refreshToken,
      clientId,
      clientSecret,
      scopes,
    );

    if (refreshResult && refreshResult.isValid) {
      // Successfully refreshed token
      return refreshResult;
    } else {
      // Refresh failed - refresh token may be invalid
      return {
        accessToken,
        refreshToken,
        isValid: false,
        accessTokenStatus: accessTokenValidity.status,
        refreshTokenStatus: 'invalid',
        errorMessage: `Access token ${accessTokenValidity.status}. Refresh token failed to generate new access token. ${refreshResult?.errorMessage || ''}`,
      };
    }
  }

  // If we can't refresh, return what we have with status info
  return {
    accessToken,
    refreshToken,
    isValid: false,
    accessTokenStatus: accessTokenValidity.status,
    refreshTokenStatus: refreshToken ? 'invalid' : 'not_provided', // If we have a refresh token but couldn't use it (missing client credentials)
    errorMessage: refreshToken
      ? `Access token ${accessTokenValidity.status}. Refresh token not used (missing client credentials).`
      : `Access token ${accessTokenValidity.status}. No refresh token provided.`,
  };
};

// Export a namespace for the OAuth functionality
export const googleOAuth = {
  generateAuthUrl,
  exchangeCodeForTokens,
  checkTokenValidity,
  checkRefreshTokenValidity,
  refreshAccessToken,
  googleOAuthManager,
  CheckAccessToken,
};

export default googleOAuthManager;
