# YouTube Analytics API

A TypeScript SDK for interacting with the YouTube Analytics API.

## Installation

```bash
npm install @microfox/youtube-analytics-api @microfox/google-oauth
```

## Environment Variables

The following environment variables are used by this SDK:

- `GOOGLE_CLIENT_ID`: The client ID for your OAuth 2.0 credentials. (Required)
- `GOOGLE_CLIENT_SECRET`: The client secret for your OAuth 2.0 credentials. (Required)
- `GOOGLE_REDIRECT_URI`: The redirect URI for your OAuth 2.0 credentials. (Required)
- `GOOGLE_ACCESS_TOKEN`: The access token obtained after completing the OAuth 2.0 flow. (Required)
- `SCOPES`: The scopes required by the SDK. (Required)

## API Reference

For detailed documentation on the constructor and all available functions, see:

- [YouTubeAnalyticsAPISDK](./docs/YouTubeAnalyticsAPISDK.md)
- [reportsQuery](./docs/reportsQuery.md)
- [listGroups](./docs/listGroups.md)
- [insertGroup](./docs/insertGroup.md)
- [updateGroup](./docs/updateGroup.md)
- [deleteGroup](./docs/deleteGroup.md)
- [listGroupItems](./docs/listGroupItems.md)
- [insertGroupItem](./docs/insertGroupItem.md)
- [deleteGroupItem](./docs/deleteGroupItem.md)
