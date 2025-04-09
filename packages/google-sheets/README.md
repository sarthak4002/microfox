# @microfox/google-sheets

TypeScript SDK for interacting with Google Sheets API.

## Project Overview

@microfox/google-sheets is a TypeScript SDK that provides a simple and type-safe way to interact with the Google Sheets API. It offers methods for reading, writing, and manipulating data in Google Sheets.

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

First, import the SDK and create an instance:

```typescript
import { createGoogleSheetsSDK } from '@microfox/google-sheets';

const accessToken = 'your-access-token';
const sdk = createGoogleSheetsSDK(accessToken);
```

Now you can use the SDK to interact with Google Sheets:

```typescript
const spreadsheetId = 'your-spreadsheet-id';
const range = 'Sheet1!A1:B2';

// Get values from a range
const values = await sdk.getValues(spreadsheetId, range);
console.log(values);

// Update values in a range
const newValues = {
  range: 'Sheet1!A1:B2',
  values: [
    ['New', 'Data'],
    ['More', 'Info'],
  ],
};
const updateResponse = await sdk.updateValues(spreadsheetId, range, newValues, {
  valueInputOption: 'USER_ENTERED',
});
console.log(updateResponse);
```

## API Reference

### `createGoogleSheetsSDK(accessToken: string): GoogleSheetsSDK`

Creates a new instance of the Google Sheets SDK.

- `accessToken`: The OAuth2 access token for authentication.

### `GoogleSheetsSDK`

#### `getValues(spreadsheetId: string, range: string, options?: object): Promise<ValueRange>`

Gets values from a spreadsheet.

- `spreadsheetId`: The ID of the spreadsheet to retrieve data from.
- `range`: The A1 notation of the range to retrieve values from.
- `options`: Additional options for the request.
  - `majorDimension?: 'ROWS' | 'COLUMNS'`
  - `valueRenderOption?: 'FORMATTED_VALUE' | 'UNFORMATTED_VALUE' | 'FORMULA'`
  - `dateTimeRenderOption?: 'SERIAL_NUMBER' | 'FORMATTED_STRING'`

#### `batchGetValues(spreadsheetId: string, ranges: string[], options?: object): Promise<BatchGetValuesResponse>`

Gets values from multiple ranges in a spreadsheet.

- `spreadsheetId`: The ID of the spreadsheet to retrieve data from.
- `ranges`: An array of A1 notation ranges to retrieve values from.
- `options`: Additional options for the request (same as `getValues`).

#### `updateValues(spreadsheetId: string, range: string, values: ValueRange, options: object): Promise<UpdateValuesResponse>`

Updates values in a spreadsheet.

- `spreadsheetId`: The ID of the spreadsheet to update.
- `range`: The A1 notation of the values to update.
- `values`: The values to update.
- `options`: Additional options for the request.
  - `valueInputOption: 'RAW' | 'USER_ENTERED'`
  - `includeValuesInResponse?: boolean`
  - `responseValueRenderOption?: 'FORMATTED_VALUE' | 'UNFORMATTED_VALUE' | 'FORMULA'`
  - `responseDateTimeRenderOption?: 'SERIAL_NUMBER' | 'FORMATTED_STRING'`

#### `batchUpdateValues(spreadsheetId: string, data: ValueRange[], options: object): Promise<BatchUpdateValuesResponse>`

Updates values in multiple ranges of a spreadsheet.

- `spreadsheetId`: The ID of the spreadsheet to update.
- `data`: An array of ValueRange objects containing the values to update.
- `options`: Additional options for the request (same as `updateValues`).

#### `appendValues(spreadsheetId: string, range: string, values: ValueRange, options: object): Promise<AppendValuesResponse>`

Appends values to a spreadsheet.

- `spreadsheetId`: The ID of the spreadsheet to update.
- `range`: The A1 notation of the values to append.
- `values`: The values to append.
- `options`: Additional options for the request.
  - `valueInputOption: 'RAW' | 'USER_ENTERED'`
  - `insertDataOption?: 'OVERWRITE' | 'INSERT_ROWS'`
  - `includeValuesInResponse?: boolean`
  - `responseValueRenderOption?: 'FORMATTED_VALUE' | 'UNFORMATTED_VALUE' | 'FORMULA'`
  - `responseDateTimeRenderOption?: 'SERIAL_NUMBER' | 'FORMATTED_STRING'`

#### `clearValues(spreadsheetId: string, range: string): Promise<ClearValuesResponse>`

Clears values from a spreadsheet.

- `spreadsheetId`: The ID of the spreadsheet to update.
- `range`: The A1 notation of the values to clear.

#### `batchClearValues(spreadsheetId: string, ranges: string[]): Promise<BatchClearValuesResponse>`

Clears values from multiple ranges in a spreadsheet.

- `spreadsheetId`: The ID of the spreadsheet to update.
- `ranges`: An array of A1 notation ranges to clear.

## Examples

### Reading and Writing Data

```typescript
import {
  createGoogleSheetsSDK,
  ValueInputOption,
} from '@microfox/google-sheets';

const sdk = createGoogleSheetsSDK('your-access-token');
const spreadsheetId = 'your-spreadsheet-id';

// Read data
const readRange = 'Sheet1!A1:B5';
const readResult = await sdk.getValues(spreadsheetId, readRange);
console.log('Read data:', readResult.values);

// Write data
const writeRange = 'Sheet1!C1:D2';
const writeValues = {
  range: writeRange,
  values: [
    ['Column C', 'Column D'],
    ['Value 1', 'Value 2'],
  ],
};
const writeResult = await sdk.updateValues(
  spreadsheetId,
  writeRange,
  writeValues,
  {
    valueInputOption: ValueInputOption.enum.USER_ENTERED,
  },
);
console.log('Cells updated:', writeResult.updatedCells);

// Append data
const appendRange = 'Sheet1!A:B';
const appendValues = {
  range: appendRange,
  values: [
    ['Appended', 'Data'],
    ['More', 'Rows'],
  ],
};
const appendResult = await sdk.appendValues(
  spreadsheetId,
  appendRange,
  appendValues,
  {
    valueInputOption: ValueInputOption.enum.USER_ENTERED,
  },
);
console.log('Appended range:', appendResult.updates.updatedRange);

// Clear data
const clearRange = 'Sheet1!E1:F10';
const clearResult = await sdk.clearValues(spreadsheetId, clearRange);
console.log('Cleared range:', clearResult.clearedRange);
```

## Configuration

The SDK uses an access token for authentication. You need to obtain this token through OAuth2 authentication with the necessary scopes for Google Sheets API.

## Dependencies

- `zod`: Used for runtime type checking and schema validation.

## Breaking Changes

Version 1.0.2 introduces several breaking changes:

1. The SDK constructor now only requires an access token instead of full OAuth2 credentials.
2. OAuth2 flow methods have been removed from the SDK. You now need to handle the OAuth2 flow externally.
3. The API methods have been updated to use more consistent parameter structures and return types.
4. New enums have been introduced for various option types (e.g., `ValueInputOption`, `ValueRenderOption`).

Please refer to the updated API Reference and Examples sections for the new usage patterns.
