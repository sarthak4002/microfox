import { Octokit } from '@octokit/rest';
import { PRCommentor } from './commentor';
import fs from 'fs';
import path from 'path';

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export const prCommentor = new PRCommentor(
  octokit,
  process.env.PR_NUMBER ? parseInt(process.env.PR_NUMBER) : undefined,
);

/**
 * Create or update research report markdown comment
 */
export async function updateResearchReport(
  step: string,
  data: {
    usage?: any;
    totalTokens?: number;
    details?: Record<string, any>;
  },
  packageDir: string,
): Promise<void> {
  const reportPath = path.join(packageDir, 'research-report.md');
  let report: string;

  if (!fs.existsSync(reportPath)) {
    report = `# Packagefox: Research Report

| Step | Status | Details | Token Usage | Total Tokens |
|------|--------|---------|-------------|--------------|
`;
  } else {
    report = fs.readFileSync(reportPath, 'utf8');
  }

  const emojiMap: Record<string, string> = {
    generateMetadata: '📝',
    extractLinks: '🔗',
    analyzeLinks: '🔍',
    extractContentFromUrls: '📄',
    summarizeContent: '📊',
  };

  const status = data.usage ? '✅' : '⏳';
  const details = data.details
    ? Object.entries(data.details)
        .map(([key, value]) => `${key}: ${value}`)
        .join('<br>')
    : '';
  const tokenUsage = data.usage
    ? `${data.usage.promptTokens} + ${data.usage.completionTokens} = ${data.usage.totalTokens}`
    : '-';
  const totalTokens = data.totalTokens ? data.totalTokens.toString() : '-';

  const newRow = `| ${emojiMap[step]} ${step} | ${status} | ${details} | ${tokenUsage} | ${totalTokens} |\n`;

  // Remove existing row for this step if it exists
  const lines = report.split('\n');
  const stepIndex = lines.findIndex(line => line.includes(step));
  if (stepIndex !== -1) {
    lines.splice(stepIndex, 1);
  }

  // Add new row
  lines.splice(2, 0, newRow);
  report = lines.join('\n');

  fs.writeFileSync(reportPath, report);

  // Update PR comment if PR_NUMBER is available
  if (process.env.PR_NUMBER) {
    await prCommentor.createOrUpdateComment(
      {
        body: report,
      },
      'Packagefox: Research Report',
    );
  }
}

/**
 * Create or update build report markdown comment
 */
export async function updateBuildReport(
  step: string,
  data: {
    status?: 'success' | 'failure' | 'in-progress';
    details?: Record<string, any>;
    error?: any;
  },
  packageDir: string,
): Promise<void> {
  const reportPath = path.join(packageDir, 'build-report.md');
  let report: string;

  if (!fs.existsSync(reportPath)) {
    report = `# Packagefox: Build Report

| Step | Status | Details | Error |
|------|--------|---------|-------|
`;
  } else {
    report = fs.readFileSync(reportPath, 'utf8');
  }

  const emojiMap: Record<string, string> = {
    build: '🏗️',
    fix: '🔧',
    analyze: '🔍',
    apply: '✏️',
    cleanup: '🧹',
  };

  const statusMap: Record<string, string> = {
    success: '✅',
    failure: '❌',
    'in-progress': '⏳',
  };

  const status = data.status ? statusMap[data.status] : '⏳';
  const details = data.details
    ? Object.entries(data.details)
        .map(([key, value]) => `${key}: ${value}`)
        .join('<br>')
    : '';
  const error = data.error ? JSON.stringify(data.error, null, 2) : '';

  const newRow = `| ${emojiMap[step]} ${step} | ${status} | ${details} | ${error} |\n`;

  // Remove existing row for this step if it exists
  const lines = report.split('\n');
  const stepIndex = lines.findIndex(line => line.includes(step));
  if (stepIndex !== -1) {
    lines.splice(stepIndex, 1);
  }

  // Add new row
  lines.splice(2, 0, newRow);
  report = lines.join('\n');

  fs.writeFileSync(reportPath, report);

  // Update PR comment if PR_NUMBER is available
  if (process.env.PR_NUMBER) {
    await prCommentor.createOrUpdateComment(
      {
        body: report,
      },
      'Packagefox: Build Report',
    );
  }
}

/**
 * Create or update documentation report markdown comment
 */
export async function updateDocReport(
  step: string,
  data: {
    status?: 'success' | 'failure' | 'in-progress';
    details?: Record<string, any>;
    error?: any;
  },
  packageDir: string,
): Promise<void> {
  const reportPath = path.join(packageDir, 'doc-report.md');
  let report: string;

  if (!fs.existsSync(reportPath)) {
    report = `# Packagefox: Documentation Report

| Step | Status | Details | Error |
|------|--------|---------|-------|
`;
  } else {
    report = fs.readFileSync(reportPath, 'utf8');
  }

  const emojiMap: Record<string, string> = {
    generate: '📝',
    validate: '✅',
    save: '💾',
    build: '🏗️',
  };

  const statusMap: Record<string, string> = {
    success: '✅',
    failure: '❌',
    'in-progress': '⏳',
  };

  const status = data.status ? statusMap[data.status] : '⏳';
  const details = data.details
    ? Object.entries(data.details)
        .map(([key, value]) => `${key}: ${value}`)
        .join('<br>')
    : '';
  const error = data.error ? JSON.stringify(data.error, null, 2) : '';

  const newRow = `| ${emojiMap[step]} ${step} | ${status} | ${details} | ${error} |\n`;

  // Remove existing row for this step if it exists
  const lines = report.split('\n');
  const stepIndex = lines.findIndex(line => line.includes(step));
  if (stepIndex !== -1) {
    lines.splice(stepIndex, 1);
  }

  // Add new row
  lines.splice(2, 0, newRow);
  report = lines.join('\n');

  fs.writeFileSync(reportPath, report);

  // Update PR comment if PR_NUMBER is available
  if (process.env.PR_NUMBER) {
    await prCommentor.createOrUpdateComment(
      {
        body: report,
      },
      'Packagefox: Documentation Report',
    );
  }
}
