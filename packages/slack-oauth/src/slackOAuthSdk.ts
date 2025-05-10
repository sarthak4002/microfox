import { z } from 'zod';
import { SlackOAuthConfig, SlackOAuthResponse, SlackTokenResponse, SlackRevokeResponse } from './types';
import { slackOAuthConfigSchema, slackOAuthResponseSchema, slackTokenResponseSchema, slackRevokeResponseSchema } from './schemas';

export class SlackOAuthSdk {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private scopes: string[];
  private userScopes?: string[];
  private team?: string;
  private isGovSlack: boolean;

  constructor(config: SlackOAuthConfig) {
    const validatedConfig = slackOAuthConfigSchema.parse(config);
    this.clientId = validatedConfig.clientId;
    this.clientSecret = validatedConfig.clientSecret;
    this.redirectUri = validatedConfig.redirectUri;
    this.scopes = validatedConfig.scopes;
    this.userScopes = validatedConfig.userScopes;
    this.team = validatedConfig.team;
    this.isGovSlack = validatedConfig.isGovSlack || false;
  }

  public getAuthorizationUrl(state?: string): string {
    const baseUrl = this.isGovSlack
      ? 'https://slack-gov.com/oauth/v2/authorize'
      : 'https://slack.com/oauth/v2/authorize';

    const params = new URLSearchParams({
      client_id: this.clientId,
      scope: this.scopes.join(','),
      redirect_uri: this.redirectUri,
    });

    if (this.userScopes && this.userScopes.length > 0) {
      params.append('user_scope', this.userScopes.join(','));
    }

    if (this.team) {
      params.append('team', this.team);
    }

    if (state) {
      params.append('state', state);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  public async exchangeCodeForToken(code: string): Promise<SlackOAuthResponse> {
    const url = 'https://slack.com/api/oauth.v2.access';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return slackOAuthResponseSchema.parse(data);
  }

  public async validateToken(token: string): Promise<SlackTokenResponse> {
    const url = 'https://slack.com/api/auth.test';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return slackTokenResponseSchema.parse(data);
  }

  public async revokeToken(token: string): Promise<SlackRevokeResponse> {
    const url = 'https://slack.com/api/auth.revoke';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return slackRevokeResponseSchema.parse(data);
  }
}

export function createSlackOAuth(config: SlackOAuthConfig): SlackOAuthSdk {
  return new SlackOAuthSdk(config);
}

