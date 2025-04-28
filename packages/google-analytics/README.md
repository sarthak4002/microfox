# Google Analytics SDK

A TypeScript SDK for interacting with the Google Analytics API.

## Installation

```bash
npm install @microfox/google-analytics
```

## Authentication

This SDK uses OAuth 2.0 for authentication. You need to provide the following credentials:

- `accessToken`: Your OAuth access token
- `refreshToken`: Your OAuth refresh token
- `clientId`: Your OAuth client ID
- `clientSecret`: Your OAuth client secret

You can obtain these credentials by following the OAuth 2.0 flow for Google Analytics.

## Environment Variables

The following environment variables are used by this SDK:

- `GOOGLE_ANALYTICS_CLIENT_ID`: The client ID for your Google Cloud project. (Required)
- `GOOGLE_ANALYTICS_CLIENT_SECRET`: The client secret for your Google Cloud project. (Required)
- `GOOGLE_ANALYTICS_REDIRECT_URI`: The redirect URI for your Google Cloud project. (Required)
- `GOOGLE_ANALYTICS_ACCESS_TOKEN`: The access token for authenticating with the Google Analytics Data API. (Required)

## Additional Information

To use this Google Analytics SDK, you need to set up a Google Cloud project and enable the Google Analytics Data API.

Visit the Google Cloud Console (https://console.cloud.google.com/) to create a new project or select an existing one.

Enable the Google Analytics Data API for your project in the API Library.

Create OAuth 2.0 credentials (client ID and client secret) in the Credentials section.

Set up your OAuth consent screen with the necessary scopes ('https://www.googleapis.com/auth/analytics.readonly' for read-only access or 'https://www.googleapis.com/auth/analytics' for full access).

Store your client ID, client secret, and redirect URI securely. Never commit these to version control.

Set up environment variables for your credentials:

- GOOGLE_ANALYTICS_CLIENT_ID

- GOOGLE_ANALYTICS_CLIENT_SECRET

- GOOGLE_ANALYTICS_REDIRECT_URI

- GOOGLE_ANALYTICS_ACCESS_TOKEN

Obtain an access token using the OAuth 2.0 flow. You can use the @microfox/google-oauth package to handle the OAuth process.

When initializing the SDK, use the createGoogleAnalyticsSDK function and pass in the required configuration.

Be aware of Google Analytics API quotas and limits. Default quota is 10,000 requests per day per project.

For high-volume applications, consider implementing exponential backoff and retry logic for API requests.

Always validate and sanitize user inputs before passing them to the API to prevent injection attacks.

Keep your access token secure and refresh it when necessary using the refreshAccessToken method.

Consult the official Google Analytics Data API documentation for the most up-to-date information on endpoints, parameters, and best practices.

## Constructor

## [createGoogleAnalyticsSDK](./docs/createGoogleAnalyticsSDK.md)

Initializes a new instance of the GoogleAnalyticsSDK.

Authentication is handled using OAuth 2.0. You will need to provide your client ID, client secret, redirect URI, and access token. The SDK uses the `@microfox/google-oauth` package for OAuth 2.0 functionalities.

Usage Example:

```typescript
import { createGoogleAnalyticsSDK } from 'google-analytics-sdk';

const sdk = createGoogleAnalyticsSDK({
  clientId: process.env.GOOGLE_ANALYTICS_CLIENT_ID,
  clientSecret: process.env.GOOGLE_ANALYTICS_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_ANALYTICS_REDIRECT_URI,
  accessToken: process.env.GOOGLE_ANALYTICS_ACCESS_TOKEN,
});

// Use the sdk object to interact with the Google Analytics Data API
```

Parameters:

- `config`: An object containing the following properties:
  - `clientId`: The client ID for your Google Cloud project.
  - `clientSecret`: The client secret for your Google Cloud project.
  - `redirectUri`: The redirect URI for your Google Cloud project.
  - `accessToken`: The access token for authenticating with the Google Analytics Data API.

Note:

- You can obtain the necessary credentials by setting up a Google Cloud project, enabling the Google Analytics Data API, and creating OAuth 2.0 credentials.
- Store your client ID, client secret, redirect URI, and access token securely. Never commit these to version control.
- Use environment variables to manage your credentials.
- Refresh the access token when necessary using the `refreshAccessToken` method.

## Functions

## [runReport](./docs/runReport.md)

Runs a report.

Parameters:

- `property`: The property ID.
- `request`: The report request.

Returns:

- A promise that resolves to the report response.

## [batchRunReports](./docs/batchRunReports.md)

Batch runs reports.

Parameters:

- `property`: The property ID.
- `request`: The batch report request.

Returns:

- A promise that resolves to the batch report response.

## [runPivotReport](./docs/runPivotReport.md)

Runs a pivot report.

Parameters:

- `property`: The property ID.
- `request`: The pivot report request.

Returns:

- A promise that resolves to the pivot report response.

## [batchRunPivotReports](./docs/batchRunPivotReports.md)

Batch runs pivot reports.

Parameters:

- `property`: The property ID.
- `request`: The batch pivot report request.

Returns:

- A promise that resolves to the batch pivot report response.

## [getMetadata](./docs/getMetadata.md)

Gets metadata.

Parameters:

- `name`: The name of the metadata resource.

Returns:

- A promise that resolves to the metadata.

## [checkCompatibility](./docs/checkCompatibility.md)

Checks compatibility.

Parameters:

- `property`: The property ID.
- `request`: The compatibility check request.

Returns:

- A promise that resolves to the compatibility check response.

## [runRealtimeReport](./docs/runRealtimeReport.md)

Runs a realtime report.

Parameters:

- `property`: The property ID.
- `request`: The realtime report request.

Returns:

- A promise that resolves to the realtime report response.

## [createAudienceExport](./docs/createAudienceExport.md)

Creates an audience export.

Parameters:

- `parent`: The parent resource name.
- `request`: The audience export creation request.

Returns:

- A promise that resolves to the audience export.

## [getAudienceExport](./docs/getAudienceExport.md)

Gets an audience export.

Parameters:

- `name`: The name of the audience export resource.

Returns:

- A promise that resolves to the audience export.

## [listAudienceExports](./docs/listAudienceExports.md)

Lists audience exports.

Parameters:

- `parent`: The parent resource name.

Returns:

- A promise that resolves to the list of audience exports.

## [runFunnelReport](./docs/runFunnelReport.md)

Runs a funnel report.

Parameters:

- `property`: The property ID.
- `request`: The funnel report request.

Returns:

- A promise that resolves to the funnel report response.

## [getPropertyQuotasSnapshot](./docs/getPropertyQuotasSnapshot.md)

Gets property quotas snapshot.

Parameters:

- `name`: The name of the property quotas snapshot resource.

Returns:

- A promise that resolves to the property quotas snapshot.

## [createAudienceList](./docs/createAudienceList.md)

Creates an audience list.

Parameters:

- `parent`: The parent resource name.
- `request`: The audience list creation request.

Returns:

- A promise that resolves to the audience list.

## [getAudienceList](./docs/getAudienceList.md)

Gets an audience list.

Parameters:

- `name`: The name of the audience list resource.

Returns:

- A promise that resolves to the audience list.

## [listAudienceLists](./docs/listAudienceLists.md)

Lists audience lists.

Parameters:

- `parent`: The parent resource name.

Returns:

- A promise that resolves to the list of audience lists.

## [createRecurringAudienceList](./docs/createRecurringAudienceList.md)

Creates a recurring audience list.

Parameters:

- `parent`: The parent resource name.
- `request`: The recurring audience list creation request.

Returns:

- A promise that resolves to the recurring audience list.

## [getRecurringAudienceList](./docs/getRecurringAudienceList.md)

Gets a recurring audience list.

Parameters:

- `name`: The name of the recurring audience list resource.

Returns:

- A promise that resolves to the recurring audience list.

## [listRecurringAudienceLists](./docs/listRecurringAudienceLists.md)

Lists recurring audience lists.

Parameters:

- `parent`: The parent resource name.

Returns:

- A promise that resolves to the list of recurring audience lists.

## [createReportTask](./docs/createReportTask.md)

Creates a report task.

Parameters:

- `parent`: The parent resource name.
- `request`: The report task creation request.

Returns:

- A promise that resolves to the report task.

## [getReportTask](./docs/getReportTask.md)

Gets a report task.

Parameters:

- `name`: The name of the report task resource.

Returns:

- A promise that resolves to the report task.

## [listReportTasks](./docs/listReportTasks.md)

Lists report tasks.

Parameters:

- `parent`: The parent resource name.

Returns:

- A promise that resolves to the list of report tasks.

## [refreshAccessToken](./docs/refreshAccessToken.md)

Refreshes the access token.

Parameters:

- `refreshToken`: The refresh token.

Returns:

- A promise that resolves when the access token is refreshed.
