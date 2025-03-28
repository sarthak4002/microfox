# X (Twitter) SDK

A lightweight, type-safe SDK for interacting with the X (Twitter) API v2.

## Installation

```bash
npm install @microfox/x-sdk
```

## Usage

```typescript
import { createXSDK } from '@microfox/x-sdk';

// Initialize the SDK with your X API credentials
const xSDK = createXSDK({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
  accessToken: 'your-access-token',
  accessSecret: 'your-access-secret',
});

// Create a tweet
const tweet = await xSDK.tweets.create({
  text: 'Hello from X SDK!',
});

// Create a tweet with media
const mediaResponse = await xSDK.media.upload(
  Buffer.from('image data'),
  'image/jpeg',
);

const tweetWithMedia = await xSDK.tweets.create({
  text: 'Check out this image!',
  media: {
    media_ids: [mediaResponse.media_id_string],
  },
});

// Get a tweet by ID
const tweetLookup = await xSDK.tweets.get('1234567890');

// Get multiple tweets
const multipleTweets = await xSDK.tweets.getMultiple([
  '1234567890',
  '0987654321',
]);

// Delete a tweet
const deleteResponse = await xSDK.tweets.delete('1234567890');

// Get user by username
const user = await xSDK.users.getByUsername('username');

// Get multiple users by usernames
const users = await xSDK.users.getByUsernames(['user1', 'user2']);

// Get authenticated user
const me = await xSDK.users.getMe();
```

## API Reference

### `createXSDK(config: XSDKConfig)`

Creates a new instance of the X SDK.

#### Config Options

- `apiKey` (string, required): Your X API key
- `apiSecret` (string, required): Your X API secret
- `accessToken` (string, required): Your X access token
- `accessSecret` (string, required): Your X access token secret

### Tweets API

#### `tweets.create(tweet: TweetCreate)`

Creates a new tweet.

```typescript
interface TweetCreate {
  text: string;
  media?: {
    media_ids: string[];
    tagged_user_ids?: string[];
  };
  poll?: {
    duration_minutes: number;
    options: string[];
  };
  reply?: {
    in_reply_to_tweet_id: string;
    exclude_reply_user_ids?: string[];
  };
  // ... other options available
}
```

#### `tweets.get(id: string, options?: { expansions?: string[] })`

Gets a tweet by ID.

#### `tweets.getMultiple(ids: string[], options?: { expansions?: string[] })`

Gets multiple tweets by their IDs.

#### `tweets.delete(id: string)`

Deletes a tweet.

### Users API

#### `users.getByUsername(username: string, options?: { expansions?: string[] })`

Gets a user by their username.

#### `users.getByUsernames(usernames: string[], options?: { expansions?: string[] })`

Gets multiple users by their usernames.

#### `users.getById(id: string, options?: { expansions?: string[] })`

Gets a user by their ID.

#### `users.getByIds(ids: string[], options?: { expansions?: string[] })`

Gets multiple users by their IDs.

#### `users.getMe(options?: { expansions?: string[] })`

Gets the authenticated user's information.

### Media API

#### `media.upload(buffer: Buffer, mimeType: string)`

Uploads media to X.

```typescript
interface MediaUploadResponse {
  media_id_string: string;
  media_id?: number;
  size?: number;
  expires_after_secs?: number;
  image?: {
    image_type?: string;
    w?: number;
    h?: number;
  };
}
```

## Error Handling

The SDK uses Zod for runtime type validation and will throw `XError` if:

- The request payload doesn't match the expected schema
- The API response doesn't match the expected schema
- The API request fails
- OAuth authentication fails

Example:

```typescript
try {
  const tweet = await xSDK.tweets.create({
    text: 'Hello, X!',
  });
  console.log('Tweet created:', tweet);
} catch (error) {
  if (error instanceof XError) {
    console.error('Failed to create tweet:', error.message);
    if (error.errors) {
      console.error('API errors:', error.errors);
    }
  }
}
```

## Type Safety

The SDK is written in TypeScript and provides comprehensive type definitions for all requests and responses. All schemas are defined using Zod for runtime type validation.
