import { GoogleAuthConfig, GoogleScope } from './types';
import {
  tokenResponseSchema,
  errorResponseSchema,
  TokenResponse,
} from './schemas/index';

export class GoogleOAuthSdk {
  private static readonly AUTH_BASE_URL =
    'https://accounts.google.com/o/oauth2/v2/auth';
  private static readonly TOKEN_URL = 'https://oauth2.googleapis.com/token';
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scopes: string[];
  private state: string;

  constructor(config: GoogleAuthConfig) {
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
    this.scopes = config.scopes || [
      GoogleScope.OPENID,
      GoogleScope.EMAIL,
      GoogleScope.PROFILE,
    ];
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
   */
  public getAuthUrl(): string {
    const authSearchParams = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(' '),
      state: this.state,
      access_type: 'offline', // To receive a refresh token
      prompt: 'consent',
    });

    return `${GoogleOAuthSdk.AUTH_BASE_URL}?${authSearchParams.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   * @param code The authorization code received from Google
   * @returns Object containing the access token and refresh token
   */
  public async exchangeCodeForTokens(code: string): Promise<{
    accessToken: string;
    refreshToken?: string | null;
    idToken?: string | null;
    expiresIn: number;
  }> {
    const tokenResponse = await this.getAccessAndRefreshTokens(code);
    return {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token || null,
      idToken: tokenResponse.id_token || null,
      expiresIn: tokenResponse.expires_in,
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
    idToken?: string;
    expiresIn: number;
  }> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const response = await fetch(GoogleOAuthSdk.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

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
      idToken: tokenResponse.id_token,
      expiresIn: tokenResponse.expires_in,
    };
  }

  /**
   * Internal method to get access token from authorization code
   * @param code The authorization code received from Google
   * @returns Google token response containing access token and optional refresh token
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

    const response = await fetch(GoogleOAuthSdk.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

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
