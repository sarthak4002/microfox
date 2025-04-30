# Instagram SDK

A TypeScript SDK for interacting with the Instagram API using OAuth 2.0. This package simplifies authentication and data access.

## Installation

```bash
npm install @microfox/instagram-fb
```

## Authentication

This SDK uses OAuth 2.0 for authentication. You need to provide the following credentials:

- `accessToken`: Your OAuth access token
- `refreshToken`: Your OAuth refresh token
- `clientId`: Your OAuth client ID
- `clientSecret`: Your OAuth client secret

You can obtain these credentials by following the OAuth 2.0 flow for Instagram.

## Environment Variables

The following environment variables are used by this SDK:

- `INSTAGRAM_CLIENT_ID`: Your Facebook App ID. Obtain this from your Facebook Developer account after creating an app. (Required)
- `INSTAGRAM_CLIENT_SECRET`: Your Facebook App Secret. Obtain this from your Facebook Developer account after creating an app. (Required)
- `INSTAGRAM_REDIRECT_URI`: Your OAuth callback URL. This is the URL where users will be redirected after authorizing your app. (Required)
- `INSTAGRAM_ACCESS_TOKEN`: A valid access token for the Instagram Graph API. Obtain this by implementing the OAuth 2.0 flow in your application. (Required)

## Additional Information

To use this SDK, you need to set up a Facebook Developer account and create an app that uses the Instagram Graph API.

Visit https://developers.facebook.com/ to create your app and obtain the necessary credentials.

Required environment variables:

- INSTAGRAM_CLIENT_ID: Your Facebook App ID

- INSTAGRAM_CLIENT_SECRET: Your Facebook App Secret

- INSTAGRAM_REDIRECT_URI: Your OAuth callback URL

- INSTAGRAM_ACCESS_TOKEN: A valid access token for the Instagram Graph API

Make sure to configure the correct permissions and features for your app in the Facebook Developer Console.

This SDK uses OAuth 2.0 for authentication. You need to implement the full OAuth flow in your application to obtain a valid access token.

Rate limits: The API has various rate limits depending on the endpoint. Notable limits include:

- Content Publishing: 50 posts within a 24-hour moving period

- oEmbed: Up to 5 million requests per 24 hours for app tokens, significantly lower for client tokens

Ensure your application respects these rate limits to avoid being blocked by the API.

For more detailed information about the Instagram Graph API, visit: https://developers.facebook.com/docs/instagram-api/

## API Reference

For detailed documentation on the constructor and all available functions, see:

- [createInstagramSDK](./docs/createInstagramSDK.md)
- [validateAccessToken](./docs/validateAccessToken.md)
- [refreshAccessToken](./docs/refreshAccessToken.md)
- [createMediaContainer](./docs/createMediaContainer.md)
- [publishMedia](./docs/publishMedia.md)
- [getComments](./docs/getComments.md)
- [getOEmbed](./docs/getOEmbed.md)
