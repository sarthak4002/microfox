import { InstagramBusinessAuthConfig, InstagramScope } from './types';
import { tokenResponseSchema, errorResponseSchema } from './schemas/index';

export class InstagramBusinessOAuthSdk {
  private static readonly AUTH_BASE_URL =
    'https://www.instagram.com/oauth/authorize';
  private static readonly TOKEN_URL =
    'https://api.instagram.com/oauth/access_token';
  private static readonly LONG_LIVED_TOKEN_URL =
    'https://graph.instagram.com/access_token';
  private static readonly REFRESH_TOKEN_URL =
    'https://graph.instagram.com/refresh_access_token';

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scopes: string[];
  private state: string;

  constructor(config: InstagramBusinessAuthConfig) {
    if (!config.clientId) throw new Error('Client ID is required');
    if (!config.clientSecret) throw new Error('Client Secret is required');
    if (!config.redirectUri) throw new Error('Redirect URI is required');

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
        InstagramScope.INSTAGRAM_BUSINESS_BASIC,
      ]),
    );
    this.state = config.state || this.generateState();
  }

  public async getState(): Promise<string> {
    return this.state;
  }

  public getAuthUrl(): string {
    const authSearchParams = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scopes.join(','),
      state: this.state,
    });

    return `${InstagramBusinessOAuthSdk.AUTH_BASE_URL}?${authSearchParams.toString()}`;
  }

  public async exchangeCodeForTokens(code: string): Promise<{
    accessToken: string;
    userId: string;
    permissions: string[];
  }> {
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri,
      code,
    });

    const response = await fetch(InstagramBusinessOAuthSdk.TOKEN_URL, {
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
        `${error.error_type}: ${error.error_message || 'Unknown error'}`,
      );
    }

    const tokenResponse = tokenResponseSchema.parse(data);
    return {
      accessToken: tokenResponse.access_token,
      userId: tokenResponse.user_id.toString(),
      permissions: tokenResponse.permissions,
    };
  }

  public async getLongLivedToken(shortLivedToken: string): Promise<{
    accessToken: string;
    tokenType: string;
    expiresIn: number;
  }> {
    const params = new URLSearchParams({
      grant_type: 'ig_exchange_token',
      client_secret: this.clientSecret,
      access_token: shortLivedToken,
    });

    const response = await fetch(
      `${InstagramBusinessOAuthSdk.LONG_LIVED_TOKEN_URL}?${params.toString()}`,
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Failed to get long-lived token: ${data.error_message || 'Unknown error'}`,
      );
    }

    return {
      accessToken: data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
    };
  }

  public async refreshToken(longLivedToken: string): Promise<{
    accessToken: string;
    tokenType: string;
    expiresIn: number;
  }> {
    const params = new URLSearchParams({
      grant_type: 'ig_refresh_token',
      access_token: longLivedToken,
    });

    const response = await fetch(
      `${InstagramBusinessOAuthSdk.REFRESH_TOKEN_URL}?${params.toString()}`,
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Failed to refresh token: ${data.error_message || 'Unknown error'}`,
      );
    }

    return {
      accessToken: data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
    };
  }

  private generateState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
