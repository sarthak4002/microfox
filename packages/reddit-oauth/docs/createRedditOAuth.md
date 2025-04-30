Initializes a new instance of the RedditOAuthSdk.

This SDK provides methods for authenticating with the Reddit API using OAuth 2.0.

Parameters:

- `config`: An object containing the client ID, client secret, redirect URI, and scopes.

Usage Example:

```typescript
import { createRedditOAuth } from '@microfox/reddit-oauth';

const redditOAuth = createRedditOAuth({
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  redirectUri: process.env.REDDIT_REDIRECT_URI,
  scopes: ['identity', 'read'],
});
```
