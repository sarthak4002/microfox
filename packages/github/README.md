# @microfox/github

octokit.js
The all-batteries-included GitHub SDK for Browsers, Node.js, and Deno.

The octokit package integrates the three main Octokit libraries

API client (REST API requests, GraphQL API queries, Authentication)
App client (GitHub App & installations, Webhooks, OAuth)
Action client (Pre-authenticated API client for single repository)

Node
Install with npm/pnpm install octokit, or yarn add octokit

```ts
import { Octokit } from '@microfox/github';
```

standalone minimal Octokit: @octokit/core.

The Octokit client can be used to send requests to GitHub's REST API and queries to GitHub's GraphQL API.

Example: Get the username for the authenticated user.

```ts
// Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// Compare: https://docs.github.com/en/rest/reference/users#get-the-authenticated-user
const {
  data: { login },
} = await octokit.rest.users.getAuthenticated();
console.log('Hello, %s', login);
```

## REST API

There are two ways of using the GitHub REST API, the octokit.rest._ endpoint methods and octokit.request. Both act the same way, the octokit.rest._ methods are just added for convenience, they use octokit.request internally.

For example

```ts
await octokit.rest.issues.create({
  owner: 'octocat',
  repo: 'hello-world',
  title: 'Hello, world!',
  body: 'I created this issue using Octokit!',
});
```
