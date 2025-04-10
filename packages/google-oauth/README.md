# Google OAuth SDK

A robust TypeScript SDK for Google OAuth 2.0 authentication and API integration. This SDK provides a simple way to integrate Google OAuth 2.0 authentication into your application with built-in security features and TypeScript support.

## Installation

```bash
npm install @microfox/google-oauth
```

## Features

- 🔒 Built-in CSRF protection with state parameter
- ✨ TypeScript support with full type definitions
- 🛡️ Input validation using Zod schemas
- 🔄 Refresh token support
- 🎯 Comprehensive Google API scopes
- 🔍 Token validation and introspection

## Usage

1. Import the SDK and necessary types:

```typescript
import { GoogleOAuthSdk, GoogleScope } from '@microfox/google-oauth';
```

2. Initialize the SDK with your Google OAuth credentials:

```typescript
const googleOAuthSdk = new GoogleOAuthSdk({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  redirectUri: 'YOUR_REDIRECT_URI',
  scopes: [GoogleScope.OPENID, GoogleScope.PROFILE, GoogleScope.EMAIL], // Optional, these are the default scopes
  state: 'custom-state-string', // Optional, a random state will be generated if not provided
});
```

3. Generate the authorization URL:

```typescript
// The SDK automatically configures offline access and consent prompt
const authUrl = googleOAuthSdk.getAuthUrl();
// This will include access_type=offline and prompt=consent by default
```

4. Handle the OAuth callback:

```typescript
// Get the state from the redirect URL and verify it
const receivedState = new URL(redirectUrl).searchParams.get('state');
const expectedState = await googleOAuthSdk.getState();

if (receivedState === expectedState) {
  const code = new URL(redirectUrl).searchParams.get('code');
  if (code) {
    try {
      const { accessToken, refreshToken, idToken, expiresIn } =
        await googleOAuthSdk.exchangeCodeForTokens(code);
      // Store tokens securely and use them for API calls
    } catch (error) {
      // Handle token exchange error
      console.error('Token exchange failed:', error);
    }
  }
} else {
  // Handle invalid state (potential CSRF attack)
  console.error('Invalid state parameter');
}
```

5. Refresh expired access tokens:

```typescript
try {
  const { accessToken, expiresIn } =
    await googleOAuthSdk.refreshAccessToken(refreshToken);
  // Update stored access token
} catch (error) {
  // Handle refresh token error
  console.error('Token refresh failed:', error);
}
```

6. Validate access tokens:

```typescript
try {
  const result = await googleOAuthSdk.validateAccessToken(accessToken);
  if (result.isValid) {
    console.log('Token is valid');
    console.log('Expires at:', new Date(result.expiresAt!).toISOString());
    console.log('Scopes:', result.scopes);
    console.log('Email:', result.email);
  } else {
    console.error('Token validation failed:', result.error);
  }
} catch (error) {
  console.error('Validation error:', error);
}
```

## Available Scopes

The SDK provides a comprehensive set of Google API scopes through the `GoogleScope` enum:

### Default Scopes (Automatically Included)

- `GoogleScope.OPENID` - OpenID Connect scope
- `GoogleScope.PROFILE` - User's basic profile information
- `GoogleScope.EMAIL` - User's email address

### Google Calendar API

- `GoogleScope.CALENDAR` - Full access to Google Calendar
- `GoogleScope.CALENDAR_READONLY` - Read-only access to calendars
- `GoogleScope.CALENDAR_EVENTS` - Manage calendar events
- `GoogleScope.CALENDAR_EVENTS_READONLY` - Read-only access to calendar events

### Google Drive API

- `GoogleScope.DRIVE` - Full access to Google Drive
- `GoogleScope.DRIVE_READONLY` - Read-only access to files
- `GoogleScope.DRIVE_FILE` - Access to files created by the app
- `GoogleScope.DRIVE_METADATA` - View and manage metadata
- `GoogleScope.DRIVE_APPDATA` - Access to application data folder
- `GoogleScope.DRIVE_SCRIPTS` - Modify and execute Google Apps Scripts

### Gmail API

- `GoogleScope.GMAIL` - Read-only access to Gmail
- `GoogleScope.GMAIL_SEND` - Send emails only
- `GoogleScope.GMAIL_COMPOSE` - Create and modify email drafts
- `GoogleScope.GMAIL_MODIFY` - All read/write operations except delete
- `GoogleScope.GMAIL_FULL` - Full access to Gmail account

### Google Contacts API

- `GoogleScope.CONTACTS` - Manage contacts
- `GoogleScope.CONTACTS_READONLY` - Read-only access to contacts
- `GoogleScope.CONTACTS_OTHER_READONLY` - Read-only access to domain's contacts

### YouTube API

- `GoogleScope.YOUTUBE` - Manage YouTube account
- `GoogleScope.YOUTUBE_READONLY` - Read-only access to YouTube data
- `GoogleScope.YOUTUBE_UPLOAD` - Upload YouTube videos
- `GoogleScope.YOUTUBE_PARTNER` - Manage YouTube content and channel

### Google Photos API

- `GoogleScope.PHOTOS` - Access to Google Photos library
- `GoogleScope.PHOTOS_READONLY` - Read-only access to photos
- `GoogleScope.PHOTOS_SHARING` - Share photos and albums

### Google Fitness API

- `GoogleScope.FITNESS` - Read fitness activity data
- `GoogleScope.FITNESS_ACTIVITY_WRITE` - Write fitness activity data
- `GoogleScope.FITNESS_LOCATION_READ` - Read location data
- `GoogleScope.FITNESS_LOCATION_WRITE` - Write location data

### Google Tasks API

- `GoogleScope.TASKS` - Manage tasks and task lists
- `GoogleScope.TASKS_READONLY` - Read-only access to tasks

### Google Workspace APIs

- `GoogleScope.SHEETS` - Full access to Google Sheets
- `GoogleScope.SHEETS_READONLY` - Read-only access to Sheets
- `GoogleScope.DOCS` - Full access to Google Docs
- `GoogleScope.DOCS_READONLY` - Read-only access to Docs

### Google Cloud Platform

- `GoogleScope.CLOUD_PLATFORM` - Full access to Google Cloud services
- `GoogleScope.CLOUD_PLATFORM_READONLY` - Read-only access to Cloud services

### Google Analytics

- `GoogleScope.ANALYTICS` - Full access to Analytics data
- `GoogleScope.ANALYTICS_READONLY` - Read-only access to Analytics

### Google Classroom

- `GoogleScope.CLASSROOM_COURSES` - Manage Classroom courses
- `GoogleScope.CLASSROOM_COURSES_READONLY` - View Classroom courses
- `GoogleScope.CLASSROOM_ROSTERS` - Manage class rosters
- `GoogleScope.CLASSROOM_PROFILE_EMAILS` - View student/teacher email addresses

### Google Meet

- `GoogleScope.MEET` - View Meet space information
- `GoogleScope.MEET_ROOMS` - View Meet room information

### Google People API

- `GoogleScope.PEOPLE` - Manage contacts and other people data
- `GoogleScope.PEOPLE_READONLY` - Read-only access to people data

### Google Chat API

- `GoogleScope.CHAT` - Send and manage chat messages
- `GoogleScope.CHAT_READONLY` - Read-only access to chat messages

## Error Handling

The SDK uses Zod for input validation and provides clear error messages:

```typescript
try {
  const { accessToken, refreshToken, idToken, expiresIn } =
    await googleOAuthSdk.exchangeCodeForTokens(code);
} catch (error) {
  if (error instanceof Error) {
    console.error('OAuth error:', error.message);
    // Error messages will be in format: "error_code: error_description"
  }
}
```

## Security Best Practices

This SDK implements several security features:

- CSRF protection using state parameter (auto-generated if not provided)
- Input validation using Zod schemas
- Automatic offline access configuration for refresh tokens
- Forced consent prompt to ensure user awareness
- Type-safe token handling
- Token validation and introspection

Best practices for implementation:

- Store client credentials securely (use environment variables)
- Keep access and refresh tokens secure
- Use HTTPS for all OAuth endpoints
- Always verify the state parameter on callbacks
- Implement proper session management
- Never expose tokens in client-side code or URLs
- Regularly validate access tokens before use

## Requirements

- Node.js >= 20.0.0
- TypeScript >= 5.0 (for TypeScript users)

## License

This SDK is released under the MIT License.
