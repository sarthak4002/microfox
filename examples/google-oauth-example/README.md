# Google OAuth Example with Microfox SDKs

This is a demonstration frontend application showing how to implement the Google OAuth flow using Microfox's suite of SDKs:

- `@microfox/google` - For OAuth token management
- `@microfox/drive` - For Google Drive API integration
- `@microfox/youtube` - For YouTube API integration

## Features

- ✅ Complete OAuth authentication flow using `@microfox/google`
- 🔑 Automatic token validation and refresh via the Microfox Google SDK
- 💾 Google Drive operations using `@microfox/drive` (list, view, create files)
- 📺 YouTube operations using `@microfox/youtube` (channel info, videos, comments)

## Setup

1. Clone the repository
2. Navigate to the example directory:
   ```bash
   cd examples/google-oauth-example
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
   Note: This will install the Microfox SDKs as dependencies
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser at [http://localhost:3000](http://localhost:3000)

## Google API Setup

To use this example, you'll need to:

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com)
2. Enable the YouTube API and Drive API for your project
3. Create OAuth credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/oauth/callback`
4. Enter your Client ID and Client Secret in the application's OAuth screen

## How It Works

1. The application uses `@microfox/google` to handle OAuth authentication
2. Users enter their Google OAuth credentials (Client ID and Secret)
3. The app creates an OAuth authorization URL and redirects to Google's consent screen
4. After consent, Google redirects back with an authorization code
5. The code is exchanged for access and refresh tokens using the Google SDK
6. Tokens are stored in browser localStorage and managed by the Microfox SDKs
7. The Drive and YouTube SDKs automatically handle token validation and refresh

## Components and SDKs Used

- **Home**: Overview and authentication status display
- **OAuth**: Uses `@microfox/google` for OAuth initialization
- **Callback**: Processes the OAuth response using the Google SDK
- **Drive**: Demonstrates `@microfox/drive` operations
- **YouTube**: Demonstrates `@microfox/youtube` operations

## Important Notes

- This example demonstrates the client-side OAuth flow with the Microfox SDKs
- For production use, implement token exchange on a backend service instead
- The example uses mock data for demonstration, but the code for real API calls is included (commented out)

## Related Microfox Packages

- [`@microfox/google`](https://github.com/microfox/google) - Google OAuth token management
- [`@microfox/drive`](https://github.com/microfox/drive) - Google Drive API integration
- [`@microfox/youtube`](https://github.com/microfox/youtube) - YouTube API integration
- [`@microfox/rest-sdk`](https://github.com/microfox/rest-sdk) - The underlying REST client used by all SDKs
