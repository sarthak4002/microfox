# Microfox YouTube SDK

A TypeScript SDK for interacting with the YouTube API with built-in OAuth token management.

## Features

- **Full API Client**: Complete interface to the YouTube API
- **Token Management**: Automatic token validation and refresh
- **Type Safety**: Strong typing with Zod validation
- **Channel Operations**: Fetch channel details and statistics
- **Video Operations**: Get video details, search, comment, and upload videos
- **Playlist Management**: Create and manage playlists
- **Error Handling**: Comprehensive error handling with helpful messages

## Installation

```bash
# Install the SDK
npm install @microfox/youtube

# Install peer dependencies
npm install @microfox/google
```

## Usage

### Basic Usage with Access Token

```typescript
import { createYouTubeSDK } from '@microfox/youtube';

// Create a YouTube SDK instance with just an access token
const youtube = await createYouTubeSDK('your-access-token');

// Get the authenticated user's channel
const channel = await youtube.getMyChannel();
console.log(`Channel: ${channel.title}`);

// Search for videos
const searchResults = await youtube.search('coding tutorials');
console.log(searchResults);
```

### Using with Token Management

```typescript
import { createYouTubeSDKWithTokens } from '@microfox/youtube';

// Create a YouTube SDK with full token management
const youtube = await createYouTubeSDKWithTokens({
  accessToken: process.env.GOOGLE_ACCESS_TOKEN,
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});

// Get token status
const tokenStatus = youtube.getTokenStatus();
console.log(`Token valid: ${tokenStatus.isValid}`);

// List videos from a channel
const videos = await youtube.listChannelVideos('CHANNEL_ID');
console.log(videos);
```

## API Reference

### Channel Operations

#### `getMyChannel(options?)`

Get the authenticated user's channel information.

```typescript
const channel = await youtube.getMyChannel();
```

#### `getChannel(channelId, options?)`

Get a specific channel by ID.

```typescript
const channel = await youtube.getChannel('UCxxxxxxxxxxxxxx');
```

### Video Operations

#### `getVideo(videoId, options?)`

Get detailed information about a specific video.

```typescript
const video = await youtube.getVideo('dQw4w9WgXcQ');
```

#### `listChannelVideos(channelId, options?)`

List videos from a channel with pagination.

```typescript
const videos = await youtube.listChannelVideos('UCxxxxxxxxxxxxxx', {
  maxResults: 25,
  order: 'date',
});
```

#### `search(query, options?)`

Search for videos, channels, or playlists.

```typescript
const results = await youtube.search('tutorial', {
  type: 'video',
  maxResults: 25,
});
```

#### `uploadVideo(options)`

Upload a video to YouTube.

```typescript
const result = await youtube.uploadVideo({
  title: 'My Video',
  description: 'Description of my video',
  tags: ['tag1', 'tag2'],
  privacyStatus: 'unlisted',
  videoFile: videoBlob, // File or Blob
});
```

### Comments

#### `addComment(videoId, text)`

Add a comment to a video.

```typescript
await youtube.addComment('dQw4w9WgXcQ', 'Great video!');
```

#### `listComments(videoId, options?)`

List comments for a video.

```typescript
const comments = await youtube.listComments('dQw4w9WgXcQ', {
  maxResults: 20,
  order: 'relevance',
});
```

### Playlists

#### `getMyPlaylists(options?)`

Get the authenticated user's playlists.

```typescript
const playlists = await youtube.getMyPlaylists();
```

#### `listPlaylistItems(playlistId, options?)`

List videos in a playlist.

```typescript
const items = await youtube.listPlaylistItems('PLxxxxxxxxxxxxxx');
```

### User Info

#### `getUserInfo()`

Get information about the authenticated user.

```typescript
const userInfo = await youtube.getUserInfo();
```

## Authentication

The SDK handles token validation and refresh automatically:

1. When you create an SDK instance with `createYouTubeSDKWithTokens()`, it checks if your access token is valid
2. If the token is expired but you provided a refresh token and client credentials, it automatically refreshes the token
3. The SDK returns detailed token status information via `getTokenStatus()`

## Error Handling

### Authentication Errors

```typescript
import { YouTubeAuthError } from '@microfox/youtube';

try {
  const youtube = await createYouTubeSDKWithTokens({
    accessToken: process.env.GOOGLE_ACCESS_TOKEN,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  });
} catch (error) {
  if (error instanceof YouTubeAuthError) {
    console.error('Authentication failed:', error.message);
    console.log('Token status:', error.tokenStatus);
  }
}
```

### API Errors

```typescript
try {
  const video = await youtube.getVideo('invalid-video-id');
} catch (error) {
  console.error('API error:', error.message);
}
```

## License

MIT
