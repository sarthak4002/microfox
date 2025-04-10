# @microfox/google-sheets

A TypeScript SDK for interacting with Google Sheets.

## Project Overview

@microfox/google-sheets is a powerful and easy-to-use TypeScript SDK for interacting with Google Sheets. It provides a simple interface to perform operations such as reading, updating, appending, and clearing data in Google Sheets.

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
import {
  createGoogleSheetsSdk,
  GoogleSheetsSdkConfig,
} from '@microfox/google-sheets';

const config: GoogleSheetsSdkConfig = {
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  accessToken: 'YOUR_ACCESS_TOKEN',
  refreshToken: 'YOUR_REFRESH_TOKEN',
};

const sheetsSdk = createGoogleSheetsSdk(config);
```

## API Reference

### `createGoogleSheetsSdk(config: GoogleSheetsSdkConfig): GoogleSheetsSdk`

Creates an instance of the Google Sheets SDK.

### `GoogleSheetsSdk`

#### `getValues(range: Range): Promise<any[][]>`

Gets values from a range in a Google Sheet.

#### `updateValues(input: UpdateValuesInput): Promise<ApiResponse>`

Updates values in a range of a Google Sheet.

#### `appendValues(input: AppendValuesInput): Promise<ApiResponse>`

Appends values to a Google Sheet.

#### `clearValues(input: ClearValuesInput): Promise<ApiResponse>`

Clears values from a range in a Google Sheet.

#### `batchGetValues(sheetId: string, ranges: string[]): Promise<any[][][]>`

Batch gets values from multiple ranges in a Google Sheet.

#### `batchUpdateValues(sheetId: string, inputs: UpdateValuesInput[]): Promise<ApiResponse[]>`

Batch updates values in multiple ranges of a Google Sheet.

#### `batchClearValues(sheetId: string, ranges: string[]): Promise<ApiResponse>`

Batch clears values from multiple ranges in a Google Sheet.

#### `validateAccessToken(): Promise<boolean>`

Validates the access token.

#### `refreshAccessToken(): Promise<void>`

Refreshes the access token.

## Examples

### Reading Values

```typescript
const range = { sheetId: 'YOUR_SHEET_ID', range: 'Sheet1!A1:B10' };
const values = await sheetsSdk.getValues(range);
console.log(values);
```

### Updating Values

```typescript
const updateInput = {
  range: { sheetId: 'YOUR_SHEET_ID', range: 'Sheet1!A1:B2' },
  values: [
    ['New Value 1', 'New Value 2'],
    ['New Value 3', 'New Value 4'],
  ],
};
const response = await sheetsSdk.updateValues(updateInput);
console.log(response);
```

### Appending Values

```typescript
const appendInput = {
  range: { sheetId: 'YOUR_SHEET_ID', range: 'Sheet1!A:B' },
  values: [['Appended Value 1', 'Appended Value 2']],
};
const response = await sheetsSdk.appendValues(appendInput);
console.log(response);
```

### Clearing Values

```typescript
const clearInput = { sheetId: 'YOUR_SHEET_ID', range: 'Sheet1!A1:B10' };
const response = await sheetsSdk.clearValues(clearInput);
console.log(response);
```

## Configuration

The SDK requires the following configuration:

```typescript
interface GoogleSheetsSdkConfig {
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
}
```

Ensure you have obtained these credentials from the Google Cloud Console and have the necessary permissions to access Google Sheets API.

## Dependencies

- @microfox/google-oauth: For handling OAuth authentication with Google
- zod: For runtime type checking and validation
