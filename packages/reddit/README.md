# Reddit TypeScript SDK

A TypeScript SDK for interacting with the Reddit API, providing functionalities for user data retrieval, search operations (users, posts, communities), post and comment processing, moderation, and comprehensive data access.

## Installation

```bash
npm install @microfox/reddit
```

## Authentication

This SDK uses OAuth 2.0 for authentication. You need to provide the following credentials:

- `accessToken`: Your OAuth access token
- `refreshToken`: Your OAuth refresh token
- `clientId`: Your OAuth client ID
- `clientSecret`: Your OAuth client secret

You can obtain these credentials by following the OAuth 2.0 flow for Reddit.

## Environment Variables

The following environment variables are used by this SDK:

- `REDDIT_CLIENT_ID`: Your Reddit application's client ID. Obtain this by creating a Reddit app at https://www.reddit.com/prefs/apps. (Required)
- `REDDIT_CLIENT_SECRET`: Your Reddit application's client secret. Obtain this by creating a Reddit app at https://www.reddit.com/prefs/apps. (Required)
- `REDDIT_ACCESS_TOKEN`: The OAuth access token for authenticating with the Reddit API. This token expires after 1 hour. (Required)
- `REDDIT_REFRESH_TOKEN`: The OAuth refresh token for obtaining new access tokens. Include `duration=permanent` in the initial authorization request to receive a refresh token. (Optional)
- `REDDIT_REDIRECT_URI`: The redirect URI you specified when creating your Reddit app. This URI must match exactly. (Required)

## Additional Information

To use this SDK, you need to obtain OAuth credentials from Reddit. Follow these steps:

1. Go to https://www.reddit.com/prefs/apps

2. Click on 'create app' or 'create another app' at the bottom

3. Fill in the required information:

   - Name: Your app's name

   - App type: Choose 'web app' for most cases

   - Description: Brief description of your app

   - About URL: Your app's website (if applicable)

   - Redirect URI: The URI where Reddit will redirect after authorization

4. Click 'create app'

5. You'll receive a Client ID and Client Secret. Keep these secure.

Environment variables:

- REDDIT_CLIENT_ID: Your Reddit application's client ID

- REDDIT_CLIENT_SECRET: Your Reddit application's client secret

- REDDIT_REDIRECT_URI: The redirect URI you specified when creating the app

To set up environment variables:

1. Create a .env file in your project root (if not already present)

2. Add the following lines to the .env file:

   REDDIT_CLIENT_ID=your_client_id_here

   REDDIT_CLIENT_SECRET=your_client_secret_here

   REDDIT_REDIRECT_URI=your_redirect_uri_here

3. Use a package like dotenv to load these variables in your application

Important notes:

- Reddit's OAuth implementation uses comma-separated scopes instead of space-separated

- Access tokens expire after 1 hour (3600 seconds)

- To get a refresh token, include 'duration=permanent' in the initial authorization request

- Rate limits: https://github.com/reddit-archive/reddit/wiki/API#rules

  - 60 requests per minute

  - OAuth2 clients may make up to 600 requests per 10 minutes

  - Monitor the X-Ratelimit headers in API responses for current limits and usage

For more detailed information, refer to the Reddit API documentation: https://www.reddit.com/dev/api/oauth

## Constructor

## [createRedditSDK](./docs/createRedditSDK.md)

# RedditSDK Constructor

Initializes a new instance of the RedditSDK.

```typescript
import { createRedditSDK } from 'your-sdk-package';

const reddit = createRedditSDK({
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  accessToken: process.env.REDDIT_ACCESS_TOKEN, // Replace with actual access token
  redirectUri: process.env.REDDIT_REDIRECT_URI,
  scopes: [
    'identity',
    'read',
    'submit',
    'edit',
    'vote',
    'history',
    'save',
    'report',
    'subscribe',
    'modconfig',
    'modposts',
    'modflair',
    'modlog',
    'modmail',
    'modothers',
    'wikiedit',
    'wikiread',
  ],
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

## Functions

## [validateAccessToken](./docs/validateAccessToken.md)

## validateAccessToken()

Validates the current access token.

```typescript
const isValid = await reddit.validateAccessToken();
console.log(isValid);
```

**Returns:** A promise that resolves to a boolean indicating whether the access token is valid.

## [refreshAccessToken](./docs/refreshAccessToken.md)

## refreshAccessToken()

Refreshes the access token using the refresh token.

```typescript
const refreshToken = 'your_refresh_token';
await reddit.refreshAccessToken(refreshToken);
```

**Parameters:**

- `refreshToken`: The refresh token obtained during the initial authorization.

## [getMe](./docs/getMe.md)

## getMe()

Retrieves information about the currently authenticated user.

```typescript
const me = await reddit.getMe();
console.log(me);
```

**Returns:** A promise that resolves to a User object.

## [getUserPreferences](./docs/getUserPreferences.md)

## getUserPreferences()

Retrieves the preferences of the currently authenticated user.

```typescript
const prefs = await reddit.getUserPreferences();
console.log(prefs);
```

**Returns:** A promise that resolves to an object containing the user's preferences.

## [updateUserPreferences](./docs/updateUserPreferences.md)

## updateUserPreferences()

Updates the preferences of the currently authenticated user.

```typescript
const newPrefs = { ... };
const updatedPrefs = await reddit.updateUserPreferences(newPrefs);
console.log(updatedPrefs);
```

**Parameters:**

- `prefs`: An object containing the new preferences.

## [getUserKarma](./docs/getUserKarma.md)

## getUserKarma()

Retrieves the karma of the currently authenticated user.

```typescript
const karma = await reddit.getUserKarma();
console.log(karma);
```

**Returns:** A promise that resolves to an object containing the user's karma.

## [getUserTrophies](./docs/getUserTrophies.md)

## getUserTrophies()

Retrieves the trophies of the currently authenticated user.

```typescript
const trophies = await reddit.getUserTrophies();
console.log(trophies);
```

**Returns:** A promise that resolves to an object containing the user's trophies.

## [getUser](./docs/getUser.md)

## getUser(username)

Retrieves information about a specific user.

```typescript
const user = await reddit.getUser('some_username');
console.log(user);
```

**Parameters:**

- `username`: The username of the user to retrieve.

**Returns:** A promise that resolves to a User object.

## [getUserContent](./docs/getUserContent.md)

## getUserContent(username, section, params)

Retrieves content (posts and comments) submitted by a specific user.

```typescript
const content = await reddit.getUserContent('some_username', 'submitted', {
  limit: 50,
});
console.log(content);
```

**Parameters:**

- `username`: The username of the user whose content to retrieve.
- `section`: The section of the user's profile to retrieve content from (e.g., 'overview', 'submitted', 'comments').
- `params`: Optional listing parameters (e.g., limit, after, before).

**Returns:** A promise that resolves to an array of Post or Comment objects.

## [getSubredditInfo](./docs/getSubredditInfo.md)

## getSubredditInfo(subreddit)

Retrieves information about a specific subreddit.

```typescript
const subreddit = await reddit.getSubredditInfo('typescript');
console.log(subreddit);
```

**Parameters:**

- `subreddit`: The name of the subreddit to retrieve information about.

**Returns:** A promise that resolves to a Subreddit object.

## [searchSubreddit](./docs/searchSubreddit.md)

## searchSubreddit(subreddit, query, params)

Searches for posts and comments within a specific subreddit.

```typescript
const results = await reddit.searchSubreddit('typescript', 'sdk', {
  sort: 'relevance',
});
console.log(results);
```

**Parameters:**

- `subreddit`: The name of the subreddit to search within.
- `query`: The search query.
- `params`: Optional search parameters (e.g., sort, t, limit, after, before).

**Returns:** A promise that resolves to an array of SearchResult objects.

## [search](./docs/search.md)

## search(query, params)

Searches for posts and comments across all of Reddit.

```typescript
const results = await reddit.search('typescript sdk', { sort: 'relevance' });
console.log(results);
```

**Parameters:**

- `query`: The search query.
- `params`: Optional search parameters (e.g., sort, t, limit, after, before).

**Returns:** A promise that resolves to an array of SearchResult objects.

## [submitComment](./docs/submitComment.md)

## submitComment(parentId, text)

Submits a new comment.

```typescript
const comment = await reddit.submitComment('t3_12345', 'This is a comment!');
console.log(comment);
```

**Parameters:**

- `parentId`: The ID of the parent post or comment.
- `text`: The text of the comment.

**Returns:** A promise that resolves to a Comment object.

## [submitPost](./docs/submitPost.md)

## submitPost(subreddit, title, content)

Submits a new post.

```typescript
const post = await reddit.submitPost('typescript', 'New SDK Released!', {
  text: 'Check out the new TypeScript SDK!',
});
console.log(post);
```

**Parameters:**

- `subreddit`: The name of the subreddit to submit the post to.
- `title`: The title of the post.
- `content`: An object containing either `text` for a text post or `url` for a link post.

**Returns:** A promise that resolves to a Post object.

## [vote](./docs/vote.md)

## vote(id, direction)

Votes on a post or comment.

```typescript
// Upvote a post
await reddit.vote('t3_12345', '1');

// Downvote a comment
await reddit.vote('t1_67890', '-1');

// Remove a vote
await reddit.vote('t3_12345', '0');
```

**Parameters:**

- `id`: The ID of the post or comment to vote on.
- `direction`: The vote direction ('1' for upvote, '-1' for downvote, '0' for no vote).

## [deletePost](./docs/deletePost.md)

## deletePost(id)

Deletes a post.

```typescript
await reddit.deletePost('t3_12345');
```

**Parameters:**

- `id`: The ID of the post to delete.

## [editUserText](./docs/editUserText.md)

## editUserText(id, text)

Edits the text of a post or comment.

```typescript
const editedPost = await reddit.editUserText('t3_12345', 'Updated post text');
console.log(editedPost);
```

**Parameters:**

- `id`: The ID of the post or comment to edit.
- `text`: The new text.

**Returns:** A promise that resolves to the updated Post or Comment object.

## [hidePost](./docs/hidePost.md)

## hidePost(id)

Hides a post.

```typescript
await reddit.hidePost('t3_12345');
```

**Parameters:**

- `id`: The ID of the post to hide.

## [unhidePost](./docs/unhidePost.md)

## unhidePost(id)

Unhides a post.

```typescript
await reddit.unhidePost('t3_12345');
```

**Parameters:**

- `id`: The ID of the post to unhide.

## [saveItem](./docs/saveItem.md)

## saveItem(id, category)

Saves a post or comment.

```typescript
await reddit.saveItem('t3_12345', 'my_category');
```

**Parameters:**

- `id`: The ID of the item to save.
- `category`: Optional category to save the item under.

## [unsaveItem](./docs/unsaveItem.md)

## unsaveItem(id)

Unsaves a post or comment.

```typescript
await reddit.unsaveItem('t3_12345');
```

**Parameters:**

- `id`: The ID of the item to unsave.

## [reportItem](./docs/reportItem.md)

## reportItem(id, reason)

Reports a post or comment.

```typescript
await reddit.reportItem('t3_12345', 'This is spam.');
```

**Parameters:**

- `id`: The ID of the item to report.
- `reason`: The reason for reporting.

## [getInfo](./docs/getInfo.md)

## getInfo(ids)

Retrieves information about multiple items (posts, comments, or subreddits) by their IDs.

```typescript
const items = await reddit.getInfo(['t3_12345', 't1_67890', 't5_abcdef']);
console.log(items);
```

**Parameters:**

- `ids`: An array of IDs to retrieve information about.

**Returns:** A promise that resolves to an array of Post, Comment, or Subreddit objects.

## [getMoreComments](./docs/getMoreComments.md)

## getMoreComments(linkId, children)

Retrieves additional comments for a post.

```typescript
const comments = await reddit.getMoreComments('t3_12345', [
  't1_67890',
  't1_98765',
]);
console.log(comments);
```

**Parameters:**

- `linkId`: The ID of the post to retrieve comments for.
- `children`: An array of comment IDs to retrieve.

**Returns:** A promise that resolves to an array of Comment objects.

## [getPost](./docs/getPost.md)

## getPost(id)

Retrieves a specific post by its ID.

```typescript
const post = await reddit.getPost('t3_12345');
console.log(post);
```

**Parameters:**

- `id`: The ID of the post to retrieve.

**Returns:** A promise that resolves to a Post object.
