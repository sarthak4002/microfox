# @microfox/github

A modern, type-safe GitHub SDK built with TypeScript and Zod for making GitHub API requests.

## Features

- 🔒 Type-safe API with Zod validation
- 🚀 Modern functional approach
- 📦 Repository management
- 🔄 Pull request operations
- 🌳 Branch management
- 📝 File operations
- ⚡ GitHub Actions integration

## Installation

```bash
npm install @microfox/github
# or
yarn add @microfox/github
# or
pnpm add @microfox/github
```

## Usage

### Initialize the SDK

```typescript
import { createGithubSdk } from '@microfox/github';

const githubSdk = createGithubSdk({
  owner: 'your-organization',
  repo: 'your-repository',
  token: 'your-github-token' // or process.env.GITHUB_TOKEN
});
```

### Examples

#### Create a Pull Request

```typescript
const pr = await githubSdk.createPullRequest({
  title: 'Feature: Add new functionality',
  head: 'feature-branch',
  base: 'main',
  body: 'This PR adds exciting new features!'
});
```

#### Create a New Branch

```typescript
const branch = await githubSdk.createBranch({
  branchName: 'feature/new-feature',
  baseBranch: 'main'
});
```

#### Update a File

```typescript
const updatedFile = await githubSdk.updateFile({
  path: 'src/config.json',
  content: JSON.stringify({ version: '2.0.0' }),
  commitMessage: 'Update config version',
  branch: 'main'
});
```

#### Get Pull Request Events

```typescript
const events = await githubSdk.getPrEvents(123);
```

## API Reference

### Repository Management

- `createRepositoryFromTemplate(params: RepoParams)`: Create a new repository from a template
- `getRepoDetails()`: Get repository information

### Pull Requests

- `createPullRequest(params: PRParams)`: Create a new pull request
- `createCommentOnPr(prNumber: number, comment: string)`: Add a comment to a PR
- `getAllPullRequests()`: Get all repository pull requests
- `getPrDetails(prNumber: number)`: Get specific pull request details
- `getPrEvents(prNumber: number, per_page?: number, page?: number)`: Get PR events timeline

### Branch Management

- `createBranch(params: BranchParams)`: Create a new branch
- `getBranches()`: List all repository branches

### File Operations

- `getFileContent(path: string, branch?: string)`: Get file contents
- `updateFile(params: UpdateFileParams)`: Create or update a file
- `getReadme(branch?: string)`: Get repository README
- `updateReadme(content: string, commitMessage: string, branch?: string)`: Update README

### GitHub Actions

- `triggerWorkflow(workflowFileName: string, inputs: Record<string, string>, inputRef?: string)`: Trigger a GitHub Actions workflow

## Types

All main interfaces are Zod-validated:

```typescript
interface GithubSdkConfig {
  owner: string;      // Repository owner
  repo: string;       // Repository name
  token: string;      // GitHub personal access token
}

interface PRParams {
  title: string;      // Pull request title
  head: string;       // Source branch
  base: string;       // Target branch
  body?: string;      // Pull request description
}

interface BranchParams {
  branchName: string; // New branch name
  baseBranch: string; // Base branch to create from
}

interface UpdateFileParams {
  path: string;       // File path in repository
  content: string;    // New file content
  commitMessage: string; // Commit message
  branch: string;     // Target branch
}
```

## Error Handling

The SDK throws errors for invalid configurations and failed API requests. Always wrap API calls in try-catch blocks:

```typescript
try {
  const pr = await githubSdk.createPullRequest({
    title: 'My PR',
    head: 'feature',
    base: 'main'
  });
} catch (error) {
  console.error('Failed to create PR:', error);
}
```
