import { z } from 'zod';

export const GithubSdkConfigSchema = z.object({
  owner: z.string().describe('The owner of the repository'),
  repo: z.string().describe('The name of the repository'),
  token: z.string().describe('GitHub personal access token').optional(),
});

export const PRParamsSchema = z.object({
  title: z.string().describe('Title of the pull request'),
  head: z.string().describe('The name of the branch where your changes are implemented'),
  base: z.string().describe('The name of the branch you want the changes pulled into'),
  body: z.string().optional().describe('The contents of the pull request'),
});

export const BranchParamsSchema = z.object({
  branchName: z.string().describe('Name of the new branch to create'),
  baseBranch: z.string().describe('Name of the branch to base the new branch on'),
});

export const RepoParamsSchema = z.object({
  newRepoName: z.string().describe('Name for the new repository'),
  newOwner: z.string().optional().describe('Owner for the new repository'),
  includeAllBranches: z.boolean().optional().describe('Whether to include all branches'),
  privateRepo: z.boolean().optional().describe('Whether the new repository should be private'),
  description: z.string().optional().describe('Description of the new repository'),
});

export const UpdateFileParamsSchema = z.object({
  path: z.string().describe('Path to the file in the repository'),
  content: z.string().describe('New content of the file'),
  commitMessage: z.string().describe('Commit message for the update'),
  branch: z.string().describe('Branch to update the file in'),
});

export type GithubSdkConfig = z.infer<typeof GithubSdkConfigSchema>;
export type PRParams = z.infer<typeof PRParamsSchema>;
export type BranchParams = z.infer<typeof BranchParamsSchema>;
export type RepoParams = z.infer<typeof RepoParamsSchema>;
export type UpdateFileParams = z.infer<typeof UpdateFileParamsSchema>; 