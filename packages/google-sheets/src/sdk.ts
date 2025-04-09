import { z } from 'zod';

/**
 * Enum for value input options
 */
const ValueInputOption = z.enum(['RAW', 'USER_ENTERED']);

/**
 * Enum for value render options
 */
const ValueRenderOption = z.enum([
  'FORMATTED_VALUE',
  'UNFORMATTED_VALUE',
  'FORMULA',
]);

/**
 * Enum for date time render options
 */
const DateTimeRenderOption = z.enum(['SERIAL_NUMBER', 'FORMATTED_STRING']);

/**
 * Enum for insert data options
 */
const InsertDataOption = z.enum(['OVERWRITE', 'INSERT_ROWS']);

/**
 * Enum for major dimensions
 */
const Dimension = z.enum(['ROWS', 'COLUMNS']);

/**
 * Schema for a range of values
 */
const ValueRange = z.object({
  range: z.string().describe('The range the values cover, in A1 notation.'),
  majorDimension: Dimension.optional().describe(
    'The major dimension of the values.',
  ),
  values: z
    .array(z.array(z.any()))
    .describe('The data that was read or to be written.'),
});

/**
 * Schema for batch get response
 */
const BatchGetValuesResponse = z.object({
  spreadsheetId: z
    .string()
    .describe('The ID of the spreadsheet the data was retrieved from.'),
  valueRanges: z
    .array(ValueRange)
    .describe('The requested ranges and their values.'),
});

/**
 * Schema for update response
 */
const UpdateValuesResponse = z.object({
  spreadsheetId: z
    .string()
    .describe('The spreadsheet the updates were applied to.'),
  updatedRange: z
    .string()
    .describe('The range (in A1 notation) that updates were applied to.'),
  updatedRows: z
    .number()
    .describe(
      'The number of rows where at least one cell in the row was updated.',
    ),
  updatedColumns: z
    .number()
    .describe(
      'The number of columns where at least one cell in the column was updated.',
    ),
  updatedCells: z.number().describe('The number of cells updated.'),
  updatedData: ValueRange.optional().describe(
    'The values of the cells after updates were applied.',
  ),
});

/**
 * Schema for batch update response
 */
const BatchUpdateValuesResponse = z.object({
  spreadsheetId: z
    .string()
    .describe('The spreadsheet the updates were applied to.'),
  totalUpdatedRows: z
    .number()
    .describe(
      'The total number of rows where at least one cell in the row was updated.',
    ),
  totalUpdatedColumns: z
    .number()
    .describe(
      'The total number of columns where at least one cell in the column was updated.',
    ),
  totalUpdatedCells: z.number().describe('The total number of cells updated.'),
  totalUpdatedSheets: z
    .number()
    .describe(
      'The total number of sheets where at least one cell in the sheet was updated.',
    ),
  responses: z
    .array(UpdateValuesResponse)
    .describe('The response for each successful update.'),
});

/**
 * Schema for append response
 */
const AppendValuesResponse = z.object({
  spreadsheetId: z
    .string()
    .describe('The spreadsheet the updates were applied to.'),
  tableRange: z
    .string()
    .describe(
      'The range (in A1 notation) of the table that values are being appended to.',
    ),
  updates: UpdateValuesResponse.describe(
    'Information about the updates that were applied.',
  ),
});

/**
 * Schema for clear response
 */
const ClearValuesResponse = z.object({
  spreadsheetId: z
    .string()
    .describe('The spreadsheet the updates were applied to.'),
  clearedRange: z
    .string()
    .describe('The range (in A1 notation) that was cleared.'),
});

/**
 * Schema for batch clear response
 */
const BatchClearValuesResponse = z.object({
  spreadsheetId: z
    .string()
    .describe('The spreadsheet the updates were applied to.'),
  clearedRanges: z
    .array(z.string())
    .describe('The ranges that were cleared, in A1 notation.'),
});

/**
 * Google Sheets SDK
 */
class GoogleSheetsSDK {
  private accessToken: string;
  private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  /**
   * Creates an instance of GoogleSheetsSDK.
   * @param {string} accessToken - The OAuth2 access token
   */
  constructor(accessToken: string) {
    if (!accessToken) {
      throw new Error('Access token is required');
    }
    this.accessToken = accessToken;
  }

  /**
   * Makes an authenticated request to the Google Sheets API
   * @param {string} endpoint - The API endpoint
   * @param {RequestInit} options - Fetch options
   * @returns {Promise<any>} - The response data
   * @private
   */
  private async request(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Gets values from a spreadsheet
   * @param {string} spreadsheetId - The ID of the spreadsheet to retrieve data from
   * @param {string} range - The A1 notation of the range to retrieve values from
   * @param {object} options - Additional options for the request
   * @returns {Promise<z.infer<typeof ValueRange>>} - The response data
   */
  async getValues(
    spreadsheetId: string,
    range: string,
    options: {
      majorDimension?: z.infer<typeof Dimension>;
      valueRenderOption?: z.infer<typeof ValueRenderOption>;
      dateTimeRenderOption?: z.infer<typeof DateTimeRenderOption>;
    } = {},
  ): Promise<z.infer<typeof ValueRange>> {
    const queryParams = new URLSearchParams(options as any).toString();
    const endpoint = `/${spreadsheetId}/values/${range}?${queryParams}`;
    const data = await this.request(endpoint);
    return ValueRange.parse(data);
  }

  /**
   * Gets values from multiple ranges in a spreadsheet
   * @param {string} spreadsheetId - The ID of the spreadsheet to retrieve data from
   * @param {string[]} ranges - The A1 notation of the ranges to retrieve values from
   * @param {object} options - Additional options for the request
   * @returns {Promise<z.infer<typeof BatchGetValuesResponse>>} - The response data
   */
  async batchGetValues(
    spreadsheetId: string,
    ranges: string[],
    options: {
      majorDimension?: z.infer<typeof Dimension>;
      valueRenderOption?: z.infer<typeof ValueRenderOption>;
      dateTimeRenderOption?: z.infer<typeof DateTimeRenderOption>;
    } = {},
  ): Promise<z.infer<typeof BatchGetValuesResponse>> {
    const queryParams = new URLSearchParams({
      ...options,
      ranges: ranges.join(','),
    } as any).toString();
    const endpoint = `/${spreadsheetId}/values:batchGet?${queryParams}`;
    const data = await this.request(endpoint);
    return BatchGetValuesResponse.parse(data);
  }

  /**
   * Updates values in a spreadsheet
   * @param {string} spreadsheetId - The ID of the spreadsheet to update
   * @param {string} range - The A1 notation of the values to update
   * @param {z.infer<typeof ValueRange>} values - The values to update
   * @param {object} options - Additional options for the request
   * @returns {Promise<z.infer<typeof UpdateValuesResponse>>} - The response data
   */
  async updateValues(
    spreadsheetId: string,
    range: string,
    values: z.infer<typeof ValueRange>,
    options: {
      valueInputOption: z.infer<typeof ValueInputOption>;
      includeValuesInResponse?: boolean;
      responseValueRenderOption?: z.infer<typeof ValueRenderOption>;
      responseDateTimeRenderOption?: z.infer<typeof DateTimeRenderOption>;
    },
  ): Promise<z.infer<typeof UpdateValuesResponse>> {
    const queryParams = new URLSearchParams(options as any).toString();
    const endpoint = `/${spreadsheetId}/values/${range}?${queryParams}`;
    const data = await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(values),
    });
    return UpdateValuesResponse.parse(data);
  }

  /**
   * Updates values in multiple ranges of a spreadsheet
   * @param {string} spreadsheetId - The ID of the spreadsheet to update
   * @param {z.infer<typeof ValueRange>[]} data - The values to update
   * @param {object} options - Additional options for the request
   * @returns {Promise<z.infer<typeof BatchUpdateValuesResponse>>} - The response data
   */
  async batchUpdateValues(
    spreadsheetId: string,
    data: z.infer<typeof ValueRange>[],
    options: {
      valueInputOption: z.infer<typeof ValueInputOption>;
      includeValuesInResponse?: boolean;
      responseValueRenderOption?: z.infer<typeof ValueRenderOption>;
      responseDateTimeRenderOption?: z.infer<typeof DateTimeRenderOption>;
    },
  ): Promise<z.infer<typeof BatchUpdateValuesResponse>> {
    const endpoint = `/${spreadsheetId}/values:batchUpdate`;
    const requestBody = {
      valueInputOption: options.valueInputOption,
      data,
      includeValuesInResponse: options.includeValuesInResponse,
      responseValueRenderOption: options.responseValueRenderOption,
      responseDateTimeRenderOption: options.responseDateTimeRenderOption,
    };
    const responseData = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    return BatchUpdateValuesResponse.parse(responseData);
  }

  /**
   * Appends values to a spreadsheet
   * @param {string} spreadsheetId - The ID of the spreadsheet to update
   * @param {string} range - The A1 notation of the values to append
   * @param {z.infer<typeof ValueRange>} values - The values to append
   * @param {object} options - Additional options for the request
   * @returns {Promise<z.infer<typeof AppendValuesResponse>>} - The response data
   */
  async appendValues(
    spreadsheetId: string,
    range: string,
    values: z.infer<typeof ValueRange>,
    options: {
      valueInputOption: z.infer<typeof ValueInputOption>;
      insertDataOption?: z.infer<typeof InsertDataOption>;
      includeValuesInResponse?: boolean;
      responseValueRenderOption?: z.infer<typeof ValueRenderOption>;
      responseDateTimeRenderOption?: z.infer<typeof DateTimeRenderOption>;
    },
  ): Promise<z.infer<typeof AppendValuesResponse>> {
    const queryParams = new URLSearchParams(options as any).toString();
    const endpoint = `/${spreadsheetId}/values/${range}:append?${queryParams}`;
    const data = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(values),
    });
    return AppendValuesResponse.parse(data);
  }

  /**
   * Clears values from a spreadsheet
   * @param {string} spreadsheetId - The ID of the spreadsheet to update
   * @param {string} range - The A1 notation of the values to clear
   * @returns {Promise<z.infer<typeof ClearValuesResponse>>} - The response data
   */
  async clearValues(
    spreadsheetId: string,
    range: string,
  ): Promise<z.infer<typeof ClearValuesResponse>> {
    const endpoint = `/${spreadsheetId}/values/${range}:clear`;
    const data = await this.request(endpoint, { method: 'POST' });
    return ClearValuesResponse.parse(data);
  }

  /**
   * Clears values from multiple ranges in a spreadsheet
   * @param {string} spreadsheetId - The ID of the spreadsheet to update
   * @param {string[]} ranges - The A1 notation of the ranges to clear
   * @returns {Promise<z.infer<typeof BatchClearValuesResponse>>} - The response data
   */
  async batchClearValues(
    spreadsheetId: string,
    ranges: string[],
  ): Promise<z.infer<typeof BatchClearValuesResponse>> {
    const endpoint = `/${spreadsheetId}/values:batchClear`;
    const data = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ ranges }),
    });
    return BatchClearValuesResponse.parse(data);
  }
}

/**
 * Creates a Google Sheets SDK instance
 * @param {string} accessToken - The OAuth2 access token
 * @returns {GoogleSheetsSDK} - The Google Sheets SDK instance
 */
export function createGoogleSheetsSDK(accessToken: string): GoogleSheetsSDK {
  return new GoogleSheetsSDK(accessToken);
}

export {
  ValueInputOption,
  ValueRenderOption,
  DateTimeRenderOption,
  InsertDataOption,
  Dimension,
  ValueRange,
  BatchGetValuesResponse,
  UpdateValuesResponse,
  BatchUpdateValuesResponse,
  AppendValuesResponse,
  ClearValuesResponse,
  BatchClearValuesResponse,
};
