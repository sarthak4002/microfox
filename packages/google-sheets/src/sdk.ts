import { z } from 'zod';

// Constants for Google OAuth endpoints
const TOKEN_INFO_URL = 'https://oauth2.googleapis.com/tokeninfo';
const TOKEN_REFRESH_URL = 'https://oauth2.googleapis.com/token';
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SHEETS_API_BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

// Basic schemas for token handling
const TokenResponseSchema = z.object({
  access_token: z.string().describe('The access token issued by the authorization server'),
  expires_in: z.number().describe('The lifetime of the access token in seconds'),
  token_type: z.string().optional().describe('The type of the token, typically "Bearer"'),
  scope: z.string().optional().describe('The scopes that the access token is valid for'),
  refresh_token: z.string().optional().describe('The refresh token used to obtain new access tokens'),
});

type TokenResponse = z.infer<typeof TokenResponseSchema>;

// Base options for SDK constructor
const GoogleSheetsSDKOptionsSchema = z.object({
  clientId: z.string().describe('Google API client ID for the application'),
  clientSecret: z.string().describe('Google API client secret for the application'),
  redirectUri: z.string().describe('URI to redirect after authentication'),
  scopes: z.array(z.string()).describe('List of OAuth scopes to request'),
  accessToken: z.string().optional().describe('Existing access token if available'),
  refreshToken: z.string().optional().describe('Existing refresh token if available'),
  accessType: z.enum(['online', 'offline']).optional().describe('Whether to issue a refresh token'),
  prompt: z.enum(['none', 'consent', 'select_account']).optional().describe('Type of authentication prompt to display')
});

type GoogleSheetsSDKOptions = z.infer<typeof GoogleSheetsSDKOptionsSchema>;

// Schemas for API responses
const ValueRangeSchema = z.object({
  range: z.string().describe('The range the values cover, in A1 notation'),
  majorDimension: z.enum(['ROWS', 'COLUMNS']).describe('The major dimension of the values'),
  values: z.array(z.array(z.any())).describe('The data that was read or to be written')
});

const BatchGetValuesResponseSchema = z.object({
  spreadsheetId: z.string().describe('The ID of the spreadsheet the data was retrieved from'),
  valueRanges: z.array(ValueRangeSchema).describe('The requested ranges and values')
});

const UpdateValuesResponseSchema = z.object({
  spreadsheetId: z.string().describe('The spreadsheet the updates were applied to'),
  updatedRange: z.string().describe('The range (in A1 notation) that was updated'),
  updatedRows: z.number().describe('The number of rows where at least one cell in the row was updated'),
  updatedColumns: z.number().describe('The number of columns where at least one cell in the column was updated'),
  updatedCells: z.number().describe('The number of cells updated')
});

const BatchUpdateValuesResponseSchema = z.object({
  spreadsheetId: z.string().describe('The spreadsheet the updates were applied to'),
  totalUpdatedRows: z.number().describe('The total number of rows where at least one cell in the row was updated'),
  totalUpdatedColumns: z.number().describe('The total number of columns where at least one cell in the column was updated'),
  totalUpdatedCells: z.number().describe('The total number of cells updated'),
  responses: z.array(UpdateValuesResponseSchema).describe('One UpdateValuesResponse per requested range, in the same order as the requests appeared')
});

const AppendValuesResponseSchema = z.object({
  spreadsheetId: z.string().describe('The spreadsheet the updates were applied to'),
  tableRange: z.string().describe('The range (in A1 notation) of the table that values are being appended to'),
  updates: UpdateValuesResponseSchema.describe('Information about the updates that were applied')
});

const ClearValuesResponseSchema = z.object({
  spreadsheetId: z.string().describe('The spreadsheet the updates were applied to'),
  clearedRange: z.string().describe('The range (in A1 notation) that was cleared')
});

const BatchClearValuesResponseSchema = z.object({
  spreadsheetId: z.string().describe('The spreadsheet the updates were applied to'),
  clearedRanges: z.array(z.string()).describe('The ranges that were cleared, in A1 notation')
});

class GoogleSheetsSDK {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private scopes: string[];
  private accessToken: string | null;
  private refreshToken: string | null;
  private accessType: 'online' | 'offline';
  private prompt: 'none' | 'consent' | 'select_account';

  constructor(options: GoogleSheetsSDKOptions) {
    const validatedOptions = GoogleSheetsSDKOptionsSchema.parse(options);
    this.clientId = validatedOptions.clientId;
    this.clientSecret = validatedOptions.clientSecret;
    this.redirectUri = validatedOptions.redirectUri;
    this.scopes = validatedOptions.scopes;
    this.accessToken = validatedOptions.accessToken || null;
    this.refreshToken = validatedOptions.refreshToken || null;
    this.accessType = validatedOptions.accessType || 'online';
    this.prompt = validatedOptions.prompt || 'consent';

    this.validateTokens();
  }

  private async validateTokens(): Promise<void> {
    if (this.accessToken) {
      const isValid = await this.checkTokenValidity(this.accessToken);
      if (!isValid && this.refreshToken) {
        await this.refreshAccessToken();
      }
    }
  }

  private async checkTokenValidity(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${TOKEN_INFO_URL}?access_token=${accessToken}`);
      return response.ok;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const params = new URLSearchParams({
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
      });

      const response = await fetch(TOKEN_REFRESH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh access token');
      }

      const data = await response.json();
      const tokenResponse = TokenResponseSchema.parse(data);
      this.accessToken = tokenResponse.access_token;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  public generateAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scopes.join(' '),
      access_type: this.accessType,
      prompt: this.prompt,
    });

    return `${AUTH_URL}?${params.toString()}`;
  }

  public async exchangeCodeForTokens(code: string): Promise<TokenResponse> {
    try {
      const params = new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
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
        throw new Error(errorData.error_description || 'Failed to exchange code for tokens');
      }

      const data = await response.json();
      const tokenResponse = TokenResponseSchema.parse(data);
      this.accessToken = tokenResponse.access_token;
      this.refreshToken = tokenResponse.refresh_token || this.refreshToken;
      return tokenResponse;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  private async makeAuthorizedRequest(url: string, method: string, body?: any): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.refreshAccessToken();
          return this.makeAuthorizedRequest(url, method, body);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error making authorized request:', error);
      throw error;
    }
  }

  /**
   * Get values from a spreadsheet
   * @param spreadsheetId The ID of the spreadsheet to retrieve data from
   * @param range The A1 notation of the range to retrieve values from
   */
  public async getValues(spreadsheetId: string, range: string): Promise<z.infer<typeof ValueRangeSchema>> {
    const url = `${SHEETS_API_BASE_URL}/${spreadsheetId}/values/${range}`;
    const response = await this.makeAuthorizedRequest(url, 'GET');
    return ValueRangeSchema.parse(response);
  }

  /**
   * Get values from multiple ranges in a spreadsheet
   * @param spreadsheetId The ID of the spreadsheet to retrieve data from
   * @param ranges An array of A1 notation ranges to retrieve
   */
  public async batchGetValues(spreadsheetId: string, ranges: string[]): Promise<z.infer<typeof BatchGetValuesResponseSchema>> {
    const url = `${SHEETS_API_BASE_URL}/${spreadsheetId}/values:batchGet?ranges=${ranges.join('&ranges=')}`;
    const response = await this.makeAuthorizedRequest(url, 'GET');
    return BatchGetValuesResponseSchema.parse(response);
  }

  /**
   * Update values in a spreadsheet
   * @param spreadsheetId The ID of the spreadsheet to update
   * @param range The A1 notation of the range to update
   * @param values The data to be written
   */
  public async updateValues(spreadsheetId: string, range: string, values: any[][]): Promise<z.infer<typeof UpdateValuesResponseSchema>> {
    const url = `${SHEETS_API_BASE_URL}/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;
    const body = {
      range,
      values,
    };
    const response = await this.makeAuthorizedRequest(url, 'PUT', body);
    return UpdateValuesResponseSchema.parse(response);
  }

  /**
   * Update values in multiple ranges of a spreadsheet
   * @param spreadsheetId The ID of the spreadsheet to update
   * @param data An array of objects containing range and values to update
   */
  public async batchUpdateValues(spreadsheetId: string, data: { range: string; values: any[][] }[]): Promise<z.infer<typeof BatchUpdateValuesResponseSchema>> {
    const url = `${SHEETS_API_BASE_URL}/${spreadsheetId}/values:batchUpdate`;
    const body = {
      data: data.map(({ range, values }) => ({ range, values })),
      valueInputOption: 'USER_ENTERED',
    };
    const response = await this.makeAuthorizedRequest(url, 'POST', body);
    return BatchUpdateValuesResponseSchema.parse(response);
  }

  /**
   * Append values to a spreadsheet
   * @param spreadsheetId The ID of the spreadsheet to append data to
   * @param range The A1 notation of the range to append after
   * @param values The data to be appended
   */
  public async appendValues(spreadsheetId: string, range: string, values: any[][]): Promise<z.infer<typeof AppendValuesResponseSchema>> {
    const url = `${SHEETS_API_BASE_URL}/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;
    const body = {
      range,
      values,
    };
    const response = await this.makeAuthorizedRequest(url, 'POST', body);
    return AppendValuesResponseSchema.parse(response);
  }

  /**
   * Clear values from a range in a spreadsheet
   * @param spreadsheetId The ID of the spreadsheet to clear
   * @param range The A1 notation of the range to clear
   */
  public async clearValues(spreadsheetId: string, range: string): Promise<z.infer<typeof ClearValuesResponseSchema>> {
    const url = `${SHEETS_API_BASE_URL}/${spreadsheetId}/values/${range}:clear`;
    const response = await this.makeAuthorizedRequest(url, 'POST');
    return ClearValuesResponseSchema.parse(response);
  }

  /**
   * Clear values from multiple ranges in a spreadsheet
   * @param spreadsheetId The ID of the spreadsheet to clear
   * @param ranges An array of A1 notation ranges to clear
   */
  public async batchClearValues(spreadsheetId: string, ranges: string[]): Promise<z.infer<typeof BatchClearValuesResponseSchema>> {
    const url = `${SHEETS_API_BASE_URL}/${spreadsheetId}/values:batchClear`;
    const body = { ranges };
    const response = await this.makeAuthorizedRequest(url, 'POST', body);
    return BatchClearValuesResponseSchema.parse(response);
  }
}

/**
 * Create a new instance of the Google Sheets SDK
 * @param options Configuration options for the SDK
 */
export function createGoogleSheetsSDK(options: GoogleSheetsSDKOptions): GoogleSheetsSDK {
  return new GoogleSheetsSDK(options);
}

export type { GoogleSheetsSDKOptions, TokenResponse, GoogleSheetsSDK };