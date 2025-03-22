import { createRestSDK, RestClient } from '@microfox/rest-sdk'; // Adjust import path as needed
import {
  GithubSdkConfig,
  GithubSdkConfigSchema,
  PRParams,
  BranchParams,
  RepoParams,
  UpdateFileParams,
} from './types';

const GITHUB_API_URL = 'https://api.github.com';

export const createGithubSdk = (config: GithubSdkConfig) => {
  // Validate config
  GithubSdkConfigSchema.parse(config);

  if (!config.token && !process.env.GITHUB_TOKEN) {
    throw new Error('GitHub token is required');
  }

  const token = config.token || process.env.GITHUB_TOKEN;

  const restSdk = createRestSDK({
    baseUrl: GITHUB_API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
  });

  // Repository Management
  const createRepositoryFromTemplate = async (params: RepoParams) => {
    return await restSdk
      .post(`/repos/${config.owner}/${config.repo}/generate`, {
        owner: params.newOwner || config.owner,
        name: params.newRepoName,
        include_all_branches: params.includeAllBranches || false,
        private: params.privateRepo || true,
        description: params.description || '',
      })
      .json();
  };

  const getRepoDetails = async () => {
    return await restSdk.get(`/repos/${config.owner}/${config.repo}`).json();
  };

  // Pull Requests Management
  const createPullRequest = async (params: PRParams) => {
    return await restSdk
      .post(`/repos/${config.owner}/${config.repo}/pulls`, params)
      .json();
  };

  const createCommentOnPr = async (prNumber: number, comment: string) => {
    return await restSdk
      .post(
        `/repos/${config.owner}/${config.repo}/issues/${prNumber}/comments`,
        { body: comment },
      )
      .json();
  };

  const getAllPullRequests = async () => {
    return await restSdk
      .get(`/repos/${config.owner}/${config.repo}/pulls`)
      .json();
  };

  const getPrDetails = async (prNumber: number) => {
    return await restSdk
      .get(`/repos/${config.owner}/${config.repo}/pulls/${prNumber}`)
      .json();
  };

  // Branch Management
  const getBranchSha = async (branch: string): Promise<string> => {
    const refData = await restSdk
      .get<{
        object: { sha: string };
      }>(`/repos/${config.owner}/${config.repo}/git/refs/heads/${branch}`)
      .json();
    return refData.object.sha;
  };

  const createBranch = async (params: BranchParams) => {
    const baseSha = await getBranchSha(params.baseBranch);
    return await restSdk
      .post(`/repos/${config.owner}/${config.repo}/git/refs`, {
        ref: `refs/heads/${params.branchName}`,
        sha: baseSha,
      })
      .json();
  };

  const getBranches = async () => {
    return await restSdk
      .get(`/repos/${config.owner}/${config.repo}/branches`)
      .json();
  };

  // File Management
  const getFileContent = async (path: string, branch: string = 'main') => {
    return await restSdk
      .get(
        `/repos/${config.owner}/${config.repo}/contents/${path}?ref=${branch}`,
      )
      .json();
  };

  const updateFile = async (params: UpdateFileParams) => {
    let currentFileData = null;

    try {
      currentFileData = (await getFileContent(
        params.path,
        params.branch,
      )) as any;
    } catch (error) {
      // File might not exist
    }

    const encodedContent = Buffer.from(params.content).toString('base64');
    const payload: any = {
      message: params.commitMessage,
      content: encodedContent,
      branch: params.branch,
    };

    if (currentFileData?.sha) {
      payload.sha = currentFileData.sha;
    }

    return await restSdk
      .put(
        `/repos/${config.owner}/${config.repo}/contents/${params.path}`,
        payload,
      )
      .json();
  };

  // GitHub Actions
  const triggerWorkflow = async (
    workflowFileName: string,
    inputs: { [key: string]: string },
    inputRef?: string,
  ) => {
    let ref = inputRef || 'main';

    if (!inputRef && inputs.pr_number) {
      const prDetails = (await getPrDetails(parseInt(inputs.pr_number))) as any;
      ref = prDetails?.head?.ref;
    }

    return await restSdk
      .post(
        `/repos/${config.owner}/${config.repo}/actions/workflows/${workflowFileName}/dispatches`,
        { ref, inputs },
      )
      .json();
  };

  const getPrEvents = async (
    prNumber: number,
    per_page: number = 30,
    page: number = 1,
  ) => {
    const events = await restSdk
      .get<
        any[]
      >(`/repos/${config.owner}/${config.repo}/issues/${prNumber}/events?per_page=${per_page}&page=${page}`)
      .json();

    const filteredEvents = events.filter((event: any) =>
      ['merged', 'closed'].includes(event.event),
    );

    const timeline = await restSdk
      .get<
        any[]
      >(`/repos/${config.owner}/${config.repo}/issues/${prNumber}/timeline?per_page=${per_page}&page=${page}`)
      .json();

    const processedTimeline = timeline.map((event: any) => ({
      ...event,
      created_at: event?.created_at || event?.author?.date || event?.updated_at,
    }));

    const combined = [...filteredEvents, ...processedTimeline];
    return combined.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  };

  return {
    createRepositoryFromTemplate,
    getRepoDetails,
    createPullRequest,
    createCommentOnPr,
    getAllPullRequests,
    getPrDetails,
    createBranch,
    getBranches,
    getFileContent,
    updateFile,
    triggerWorkflow,
    getPrEvents,
  };
};
