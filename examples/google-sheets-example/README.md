# Google Sheets Example

This example demonstrates how to use the Microfox Google OAuth and Google Sheets SDKs to interact with Google Sheets.

## Features

- Google OAuth authentication
- Token management (access token, refresh token)
- Google Sheets operations:
  - Read values from a sheet
  - Update values in a sheet
  - Append values to a sheet

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Cloud project with Google Sheets API enabled
- OAuth 2.0 credentials (Client ID and Client Secret)

## Setup

1. Clone the repository
2. Navigate to the example directory:
   ```
   cd examples/google-sheets-example
   ```
3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn
   ```

## Google Cloud Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API for your project
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application" as the application type
   - Add your redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Copy the Client ID and Client Secret

## Running the Example

1. Start the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```
2. Open your browser and navigate to `http://localhost:3000`
3. Go to the OAuth page and enter your Client ID and Client Secret
4. Click "Save Credentials" and then "Authenticate with Google"
5. After authentication, go to the Sheets page to interact with Google Sheets

## Usage

1. **Authentication**:

   - Enter your Google OAuth Client ID and Client Secret
   - Click "Save Credentials" to store them in localStorage
   - Click "Authenticate with Google" to start the OAuth flow
   - After successful authentication, you'll be redirected to the Sheets page

2. **Google Sheets Operations**:
   - Enter your Google Spreadsheet ID (from the URL)
   - Enter the Sheet Name
   - Enter the range you want to work with (e.g., A1:B10)
   - Enter values in the table
   - Click the appropriate button to perform the operation:
     - "Read" to retrieve data from the sheet
     - "Update" to update data in the sheet
     - "Append" to append data to the sheet

## Notes

- The example uses localStorage to store tokens and credentials for simplicity
- In a production environment, you should use a more secure method to store sensitive information
- The example demonstrates basic Google Sheets operations; the SDK supports more advanced operations

## Troubleshooting

- If you encounter authentication issues, make sure your OAuth credentials are correct and the redirect URI is properly configured
- If you encounter API errors, check that the Google Sheets API is enabled for your project
- If you encounter CORS issues, make sure your redirect URI is correctly set in the Google Cloud Console
