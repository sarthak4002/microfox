# RedditSDK Constructor

Initializes a new instance of the RedditSDK.

```typescript
import { createRedditSDK } from 'your-sdk-package';

const reddit = createRedditSDK({
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  accessToken: process.env.REDDIT_ACCESS_TOKEN, // Replace with actual access token
  redirectUri: process.env.REDDIT_REDIRECT_URI,
  scopes: ['identity', 'read', 'submit', 'edit', 'vote', 'history', 'save', 'report', 'subscribe', 'modconfig', 'modposts', 'modflair', 'modlog', 'modmail', 'modothers', 'wikiedit', 'wikiread'],
});
```

## Parameters

- `config`: An object containing the following properties:
  - `clientId`: The client ID for your Reddit application.
  - `clientSecret`: The client secret for your Reddit application.
  - `accessToken`: The OAuth access token.
  - `redirectUri`: The redirect URI for your Reddit application.
  - `scopes`: An array of OAuth scopes required for your application.

## Usage Examples

```typescript
// Get user information
const me = await reddit.getMe();
console.log(me);

// Get subreddit information
subreddit = await reddit.getSubredditInfo('typescript');
console.log(subreddit);
```