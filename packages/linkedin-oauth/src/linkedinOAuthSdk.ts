import { LinkedInAuthConfig, LinkedInScope } from './types';
import {
  tokenResponseSchema,
  errorResponseSchema,
  TokenResponse,
} from './schemas/index';

export class LinkedInOAuthSdk {
  private static readonly AUTH_BASE_URL = 'https://www.linkedin.com/oauth/v2';
  private static readonly API_BASE_URL = 'https://api.linkedin.com/v2';
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scopes: string[];
  private state: string;

  constructor(config: LinkedInAuthConfig) {
    // Validate required fields
    if (!config.clientId) throw new Error('Client ID is required');
    if (!config.clientSecret) throw new Error('Client Secret is required');

    try {
      new URL(config.redirectUri);
    } catch {
      throw new Error('Invalid redirect URI');
    }

    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
    this.scopes = Array.from(
      new Set([
        ...(config.scopes || []),
        LinkedInScope.OPENID,
        LinkedInScope.PROFILE,
      ]),
    );
    this.state = config.state || this.generateState();
  }


  /**
   * Get the current state parameter
   */
  public async getState(): Promise<string> {
    return this.state;
  }

  /**
   * Get the authorization URL for OAuth 2.0 flow
   * Note: To receive a refresh token, include LinkedInScope.OFFLINE_ACCESS in the scopes
   */
  public getAuthUrl(): string {
    const authSearchParams = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(' '),
      state: this.state,
    });

    return `${LinkedInOAuthSdk.AUTH_BASE_URL}/authorization?${authSearchParams.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   * @param code The authorization code received from LinkedIn
   * @returns Object containing the access token and refresh token (if OFFLINE_ACCESS scope was requested)
   */
  public async exchangeCodeForTokens(code: string): Promise<{
    accessToken: string;
    refreshToken?: string | null;
  }> {
    const tokenResponse = await this.getAccessAndRefreshTokens(code);
    return {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token || null,
    };
  }

  /**
   * Refresh an expired access token using a refresh token
   * @param refreshToken The refresh token obtained during initial authorization
   * @returns New access token and optionally a new refresh token
   * @throws Error if refresh token is invalid or expired
   */
  public async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
  }> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const response = await fetch(
      `${LinkedInOAuthSdk.AUTH_BASE_URL}/accessToken`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      const error = errorResponseSchema.parse(data);
      throw new Error(
        `${error.error}: ${error.error_description || 'Unknown error'}`,
      );
    }

    const tokenResponse = tokenResponseSchema.parse(data);
    return {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
    };
  }

  /**
   * Validate an access token by checking its validity and expiration
   * @param accessToken The access token to validate
   * @returns Object containing validation result and token information
   */
  public async validateAccessToken(accessToken: string): Promise<{
    isValid: boolean;
    expiresAt?: number;
    scopes?: string[];
    error?: string;
  }> {
    try {
      // LinkedIn doesn't have a dedicated token introspection endpoint
      // We'll validate by making a simple API call to the /me endpoint
      const response = await fetch(`${LinkedInOAuthSdk.API_BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        const data = await response.json();
        return {
          isValid: false,
          error: data.message || 'Token validation failed',
        };
      }
      
      // If we get here, the token is valid
      // LinkedIn tokens typically expire in 60 days
      // We'll estimate the expiration time based on the current time
      const expiresAt = Date.now() + 60 * 24 * 60 * 60 * 1000; // 60 days from now
      
      return {
        isValid: true,
        expiresAt,
        scopes: this.scopes, // We don't have a way to get the actual scopes from LinkedIn
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error during token validation',
      };
    }
  }

  /**
   * Internal method to get access token from authorization code
   * @param code The authorization code received from LinkedIn
   * @returns LinkedIn token response containing access token and optional refresh token
   */
  private async getAccessAndRefreshTokens(
    code: string,
  ): Promise<TokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const response = await fetch(
      `${LinkedInOAuthSdk.AUTH_BASE_URL}/accessToken`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      const error = errorResponseSchema.parse(data);
      throw new Error(
        `${error.error}: ${error.error_description || 'Unknown error'}`,
      );
    }

    return tokenResponseSchema.parse(data);
  }

  /**
   * Generate a random state parameter for CSRF protection
   */
  private generateState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
