# @microfox/google-sheets

A TypeScript SDK for interacting with Google Sheets API.

## Project Overview

@microfox/google-sheets is a powerful and type-safe SDK for interacting with the Google Sheets API. It provides a simple interface to perform operations such as reading, writing, and modifying data in Google Sheets.

## Installation

Install the package using npm:

```bash
npm install @microfox/google-sheets
```

Or using yarn:

```bash
yarn add @microfox/google-sheets
```

## Usage

First, import the SDK:

```typescript
import {
  createGoogleSheetsSDK,
  GoogleSheetsSDKOptions,
} from '@microfox/google-sheets';
```

Then, create an instance of the SDK:

```typescript
const options: GoogleSheetsSDKOptions = {
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  redirectUri: 'YOUR_REDIRECT_URI',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
};

const sheetsSDK = createGoogleSheetsSDK(options);
```

## API Reference

### `createGoogleSheetsSDK(options: GoogleSheetsSDKOptions): GoogleSheetsSDK`

Creates a new instance of the Google Sheets SDK.

#### Parameters:

- `options`: Configuration options for the SDK
  - `clientId`: Google API client ID for the application
  - `clientSecret`: Google API client secret for the application
  - `redirectUri`: URI to redirect after authentication
  - `scopes`: List of OAuth scopes to request
  - `accessToken` (optional): Existing access token if available
  - `refreshToken` (optional): Existing refresh token if available
  - `accessType` (optional): Whether to issue a refresh token ('online' or 'offline')
  - `prompt` (optional): Type of authentication prompt to display ('none', 'consent', or 'select_account')

### `GoogleSheetsSDK` Methods

#### `generateAuthUrl(): string`

Generates the OAuth 2.0 authorization URL.

#### `exchangeCodeForTokens(code: string): Promise<TokenResponse>`

Exchanges an authorization code for access and refresh tokens.

#### `getValues(spreadsheetId: string, range: string): Promise<ValueRange>`

Retrieves values from a specified range in a spreadsheet.

#### `batchGetValues(spreadsheetId: string, ranges: string[]): Promise<BatchGetValuesResponse>`

Retrieves values from multiple ranges in a spreadsheet.

#### `updateValues(spreadsheetId: string, range: string, values: any[][]): Promise<UpdateValuesResponse>`

Updates values in a specified range of a spreadsheet.

#### `batchUpdateValues(spreadsheetId: string, data: { range: string; values: any[][] }[]): Promise<BatchUpdateValuesResponse>`

Updates values in multiple ranges of a spreadsheet.

#### `appendValues(spreadsheetId: string, range: string, values: any[][]): Promise<AppendValuesResponse>`

Appends values to a specified range in a spreadsheet.

#### `clearValues(spreadsheetId: string, range: string): Promise<ClearValuesResponse>`

Clears values from a specified range in a spreadsheet.

#### `batchClearValues(spreadsheetId: string, ranges: string[]): Promise<BatchClearValuesResponse>`

Clears values from multiple ranges in a spreadsheet.

## Examples

### Reading Values

```typescript
const spreadsheetId = 'YOUR_SPREADSHEET_ID';
const range = 'Sheet1!A1:B5';

try {
  const result = await sheetsSDK.getValues(spreadsheetId, range);
  console.log(result.values);
} catch (error) {
  console.error('Error reading values:', error);
}
```

### Updating Values

```typescript
const spreadsheetId = 'YOUR_SPREADSHEET_ID';
const range = 'Sheet1!A1:B2';
const values = [
  ['New', 'Data'],
  ['Goes', 'Here'],
];

try {
  const result = await sheetsSDK.updateValues(spreadsheetId, range, values);
  console.log(`Updated ${result.updatedCells} cells`);
} catch (error) {
  console.error('Error updating values:', error);
}
```

### Appending Values

```typescript
const spreadsheetId = 'YOUR_SPREADSHEET_ID';
const range = 'Sheet1!A:B';
const values = [
  ['Appended', 'Row'],
  ['Another', 'Row'],
];

try {
  const result = await sheetsSDK.appendValues(spreadsheetId, range, values);
  console.log(`Appended to range: ${result.updates.updatedRange}`);
} catch (error) {
  console.error('Error appending values:', error);
}
```

## Configuration

The SDK uses the following configuration options:

- `clientId`: Your Google API client ID
- `clientSecret`: Your Google API client secret
- `redirectUri`: The redirect URI for OAuth 2.0 flow
- `scopes`: An array of OAuth 2.0 scopes to request
- `accessToken` (optional): An existing access token
- `refreshToken` (optional): An existing refresh token
- `accessType` (optional): The access type for OAuth 2.0 flow ('online' or 'offline')
- `prompt` (optional): The prompt type for OAuth 2.0 flow ('none', 'consent', or 'select_account')

## Dependencies

- `zod`: For runtime type checking and schema validation

## License

[MIT License](LICENSE)
