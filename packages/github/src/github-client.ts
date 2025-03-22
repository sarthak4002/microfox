import { AIFunctionsProvider, assert, getEnv } from '@microfox/core';
import { Octokit } from 'octokit';
import { z } from 'zod';

export namespace github {
  export const UserSchema = z.object({
    id: z.number().describe('Unique identifier of the user'),
    login: z.string().describe('Username of the user'),
    name: z.string().describe('Full name of the user'),
    bio: z.string().describe('User bio/description'),
    node_id: z.string().describe('Node ID in GitHub's GraphQL API'),
    gravatar_id: z.string().describe('Gravatar ID for the user'),
    type: z.string().describe('Type of account, typically "User"'),
    site_admin: z.boolean().describe('Whether the user is a GitHub site admin'),
    company: z.string().describe('Company the user works for'),
    blog: z.string().optional().describe('URL to the user's blog or website'),
    location: z.string().optional().describe('User's physical location'),
    hireable: z.boolean().optional().describe('Whether the user is available for hire'),
    twitter_username: z.string().optional().describe('User's Twitter username'),
    email: z.string().optional().describe('User's public email address'),
    public_repos: z.number().describe('Number of public repositories the user owns'),
    public_gists: z.number().describe('Number of public gists the user owns'),
    followers: z.number().describe('Number of followers the user has'),
    following: z.number().describe('Number of users the user follows'),
    avatar_url: z.string().describe('URL to the user's profile image'),
    url: z.string().describe('API URL for this user'),
    html_url: z.string().describe('URL to the user's GitHub profile'),
    followers_url: z.string().describe('API URL for user's followers'),
    following_url: z.string().describe('API URL for users this user follows'),
    gists_url: z.string().describe('API URL for user's gists'),
    starred_url: z.string().describe('API URL for user's starred repositories'),
    subscriptions_url: z.string().describe('API URL for user's subscriptions'),
    organizations_url: z.string().describe('API URL for user's organizations'),
    repos_url: z.string().describe('API URL for user's repositories'),
    events_url: z.string().describe('API URL for user's events'),
    received_events_url: z.string().describe('API URL for events received by user'),
    created_at: z.string().describe('Timestamp when the user account was created'),
    updated_at: z.string().describe('Timestamp when the user account was last updated')
  });
  export type User = z.infer<typeof UserSchema>;
}

/**
 * Basic GitHub API wrapper.
 */
export class GitHubClient extends AIFunctionsProvider {
  protected readonly apiKey: string;
  protected readonly octokit: Octokit;

  constructor({
    apiKey = getEnv('GITHUB_API_KEY'),
  }: {
    apiKey?: string;
  } = {}) {
    assert(
      apiKey,
      'GitHubClient missing required "apiKey" (defaults to "GITHUB_API_KEY")',
    );
    super();

    this.apiKey = apiKey;
    this.octokit = new Octokit({ auth: apiKey });
  }

  async getUserByUsername(
    usernameOrOpts: string | { username: string },
  ): Promise<github.User> {
    const { username } =
      typeof usernameOrOpts === 'string'
        ? { username: usernameOrOpts }
        : usernameOrOpts;

    const res = await this.octokit.request(`GET /users/${username}`, {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    return res.data;
  }
}
