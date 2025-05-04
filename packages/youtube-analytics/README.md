# Youtube Analytics SDK

A TypeScript SDK for interacting with the YouTube Analytics API.

## Installation

```bash
npm install @microfox/youtube-analytics @microfox/google-oauth
```

## Environment Variables

The following environment variables are used by this SDK:

- `GOOGLE_ACCESS_TOKEN`: OAuth 2.0 access token. (Required)
- `GOOGLE_REFRESH_TOKEN`: OAuth 2.0 refresh token. (Optional)
- `GOOGLE_CLIENT_ID`: OAuth 2.0 client ID. (Required)
- `GOOGLE_CLIENT_SECRET`: OAuth 2.0 client secret. (Required)
- `GOOGLE_REDIRECT_URI`: OAuth 2.0 redirect URI. (Required)
- `SCOPES`: OAuth scopes for the YouTube Analytics API. (Required)

## API Reference

For detailed documentation on the constructor and all available functions, see:

- [YoutubeAnalyticsSDK](./docs/YoutubeAnalyticsSDK.md)
- [reportsQuery](./docs/reportsQuery.md)
- [groupsList](./docs/groupsList.md)
- [groupsInsert](./docs/groupsInsert.md)
- [groupsUpdate](./docs/groupsUpdate.md)
- [groupsDelete](./docs/groupsDelete.md)
- [groupItemsList](./docs/groupItemsList.md)
- [groupItemsInsert](./docs/groupItemsInsert.md)
- [groupItemsDelete](./docs/groupItemsDelete.md)
- [refreshAccessToken](./docs/refreshAccessToken.md)
