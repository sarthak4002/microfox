# Google Search Console

A TypeScript SDK for interacting with the Google Search Console API.

## Installation

```bash
npm install @microfox/google-seo
```

## Authentication

This SDK uses OAuth 2.0 for authentication. You need to provide the following credentials:

- `accessToken`: Your OAuth access token
- `refreshToken`: Your OAuth refresh token
- `clientId`: Your OAuth client ID
- `clientSecret`: Your OAuth client secret

You can obtain these credentials by following the OAuth 2.0 flow for Google Search Console.

## Environment Variables

The following environment variables are used by this SDK:

- `GOOGLE_CLIENT_ID`: Your Google OAuth 2.0 client ID. (Required)
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth 2.0 client secret. (Required)
- `GOOGLE_REDIRECT_URI`: The redirect URI you specified in your Google Cloud Console. (Required)
- `GOOGLE_ACCESS_TOKEN`: Your Google OAuth 2.0 access token. (Required)

## Additional Information

To use this SDK, you need to obtain Google OAuth 2.0 credentials (client ID and client secret) from the Google Cloud Console (https://console.cloud.google.com/).

Enable the Google Search Console API in your Google Cloud project.

Set up the following environment variables:

- GOOGLE_CLIENT_ID: Your Google OAuth 2.0 client ID

- GOOGLE_CLIENT_SECRET: Your Google OAuth 2.0 client secret

- GOOGLE_REDIRECT_URI: The redirect URI you specified in your Google Cloud Console

- GOOGLE_ACCESS_TOKEN: Your Google OAuth 2.0 access token

To obtain an access token, you need to go through the OAuth 2.0 flow. You can use the @microfox/google-oauth package to handle this process.

This SDK requires the following OAuth 2.0 scopes: https://www.googleapis.com/auth/webmasters and https://www.googleapis.com/auth/webmasters.readonly

Make sure to handle token refresh when the access token expires. You can use the refreshAccessToken method provided by the SDK.

The Google Search Console API has usage quotas and limits. Please refer to the official documentation for the most up-to-date information on rate limits: https://developers.google.com/webmaster-tools/search-console-api-original/v3/limits

## Constructor

## [createGoogleSearchConsoleSDK](./docs/createGoogleSearchConsoleSDK.md)

Initializes a new instance of the `GoogleSearchConsoleSDK`.

This SDK allows you to interact with the Google Search Console API. You can use it to manage sites, sitemaps, search analytics, and URL inspection data.

**Usage Example:**

```typescript
import { createGoogleSearchConsoleSDK } from 'google-search-console';

const sdk = createGoogleSearchConsoleSDK({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
  accessToken: process.env.GOOGLE_ACCESS_TOKEN,
});

// Use the SDK to interact with the Google Search Console API
const sites = await sdk.listSites();
console.log(sites);
```

## Functions

## [validateAccessToken](./docs/validateAccessToken.md)

Validates the current access token.

Throws an error if the access token is invalid.

**Code Example:**

```typescript
await sdk.validateAccessToken();
```

## [refreshAccessToken](./docs/refreshAccessToken.md)

Refreshes the access token using the provided refresh token.

**Code Example:**

```typescript
await sdk.refreshAccessToken(refreshToken);
```

## [listSites](./docs/listSites.md)

Lists all sites verified by the authenticated user.

**Code Example:**

```typescript
const sites = await sdk.listSites();
console.log(sites);
```

## [getSite](./docs/getSite.md)

Retrieves information about a specific site.

**Code Example:**

```typescript
const site = await sdk.getSite('https://www.example.com/');
console.log(site);
```

## [addSite](./docs/addSite.md)

Adds a site to the authenticated user's Search Console account.

**Code Example:**

```typescript
await sdk.addSite('https://www.example.com/');
```

## [deleteSite](./docs/deleteSite.md)

Deletes a site from the authenticated user's Search Console account.

**Code Example:**

```typescript
await sdk.deleteSite('https://www.example.com/');
```

## [listSitemaps](./docs/listSitemaps.md)

Lists all sitemaps submitted for a specific site.

**Code Example:**

```typescript
const sitemaps = await sdk.listSitemaps('https://www.example.com/');
console.log(sitemaps);
```

## [getSitemap](./docs/getSitemap.md)

Retrieves information about a specific sitemap.

**Code Example:**

```typescript
const sitemap = await sdk.getSitemap('https://www.example.com/', 'sitemap.xml');
console.log(sitemap);
```

## [submitSitemap](./docs/submitSitemap.md)

Submits a sitemap for a specific site.

**Code Example:**

```typescript
await sdk.submitSitemap('https://www.example.com/', 'sitemap.xml');
```

## [deleteSitemap](./docs/deleteSitemap.md)

Deletes a sitemap for a specific site.

**Code Example:**

```typescript
await sdk.deleteSitemap('https://www.example.com/', 'sitemap.xml');
```

## [querySearchAnalytics](./docs/querySearchAnalytics.md)

Queries search analytics data for a specific site.

**Code Example:**

```typescript
const data = await sdk.querySearchAnalytics('https://www.example.com/', {
  startDate: '2023-01-01',
  endDate: '2023-12-31',
  dimensions: ['query'],
});
console.log(data);
```

## [inspectUrl](./docs/inspectUrl.md)

Inspects a specific URL.

**Code Example:**

```typescript
const result = await sdk.inspectUrl({
  inspectionUrl: 'https://www.example.com/page',
  siteUrl: 'https://www.example.com/',
});
console.log(result);
```
