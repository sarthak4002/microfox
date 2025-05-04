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

// Define the expected order of steps for each report type
const researchSteps = [
  'generateMetadata',
  'extractLinks',
  'analyzeLinks',
  'extractContentFromUrls',
  'summarizeContent',
];
const buildSteps = ['build', 'fix', 'analyze', 'apply', 'cleanup'];
const docSteps = ['generate', 'validate', 'save', 'build'];

// Helper function to extract step name from a table row
function getStepName(
  line: string,
  emojis: Record<string, string>,
): string | null {
  if (!line.startsWith('|') || line.startsWith('|------')) return null; // Ignore header/separator
  const cellContent = line.split('|')[1]?.trim();
  if (!cellContent) return null;

  for (const step in emojis) {
    if (cellContent.startsWith(`${emojis[step]} ${step}`)) {
      return step;
    }
  }
  return null; // Should not happen if emojis are correct
}

/**
 * Reads and aggregates usage data from the .microfox/pr-usage.json file.
 * Handles file not found and JSON parsing errors gracefully.
 */
function readUsageData(
  packageDir: string,
): { totalTokens: number; totalCost: number } | null {
  const usageFilePath = path.join(
    process.cwd().replace('/scripts', ''),
    '.microfox',
    'pr-usage.json',
  );

  if (!fs.existsSync(usageFilePath)) {
    return null;
  }

  try {
    const usageContent = fs.readFileSync(usageFilePath, 'utf-8');
    const usageLog = JSON.parse(usageContent);

    let totalTokens = 0;
    let totalCost = 0;

    for (const modelName in usageLog) {
      if (usageLog.hasOwnProperty(modelName)) {
        const modelData = usageLog[modelName];
        // Calculate total tokens for this model entry if not present
        const entryTokens =
          modelData.usage.totalTokens ??
          modelData.usage.promptTokens + modelData.usage.completionTokens;
        totalTokens += entryTokens;
        totalCost += modelData.cost || 0; // Add cost, default to 0 if missing
      }
    }

    // Recalculate totalTokens from prompt and completion tokens for accuracy
    totalTokens = 0;
    for (const modelName in usageLog) {
      if (usageLog.hasOwnProperty(modelName)) {
        const modelData = usageLog[modelName];
        totalTokens +=
          (modelData.usage.promptTokens || 0) +
          (modelData.usage.completionTokens || 0);
      }
    }

    return { totalTokens, totalCost };
  } catch (error) {
    console.error('Error reading or parsing usage file:', error);
    return null;
  }
}

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

  const lines = report.split('\n');
  const stepIndex = lines.findIndex(line => line.includes(step));
  let insertIndex = -1;

  if (stepIndex !== -1) {
    insertIndex = stepIndex;
    lines.splice(stepIndex, 1);
  } else {
    const separatorIndex = lines.findIndex(line => line.startsWith('|------'));
    if (separatorIndex !== -1) {
      insertIndex = separatorIndex + 1;
    } else {
      insertIndex = 3;
    }
  }

  lines.splice(insertIndex, 0, newRow);

  // Separate header/separator lines from data lines
  const separatorIndex = lines.findIndex(line => line.startsWith('|------'));
  const headerLines = lines.slice(0, separatorIndex + 1);
  let dataLines = lines
    .slice(separatorIndex + 1)
    .filter(line => line.trim() !== ''); // Filter empty lines

  // Sort data lines based on predefined step order
  dataLines.sort((a, b) => {
    const stepA = getStepName(a, emojiMap);
    const stepB = getStepName(b, emojiMap);
    const indexA = stepA ? researchSteps.indexOf(stepA) : -1;
    const indexB = stepB ? researchSteps.indexOf(stepB) : -1;

    // Handle cases where a step might not be in the predefined list (shouldn't happen ideally)
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });

  // Reconstruct the report
  report = headerLines.join('\n') + '\n' + dataLines.join('\n');

  // Add usage footer
  const usageData = readUsageData(packageDir);
  if (usageData) {
    report += `\n\n---\n**Total Usage:** Tokens: ${usageData.totalTokens} | Cost: $${usageData.totalCost.toFixed(4)}`;
  }

  // Ensure directory exists before writing
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, report);

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

  const lines = report.split('\n');
  const stepIndex = lines.findIndex(line => line.includes(step));
  let insertIndex = -1;

  if (stepIndex !== -1) {
    insertIndex = stepIndex;
    lines.splice(stepIndex, 1);
  } else {
    const separatorIndex = lines.findIndex(line => line.startsWith('|------'));
    if (separatorIndex !== -1) {
      insertIndex = separatorIndex + 1;
    } else {
      insertIndex = 3;
    }
  }

  lines.splice(insertIndex, 0, newRow);

  // Separate header/separator lines from data lines
  const separatorIndex = lines.findIndex(line => line.startsWith('|------'));
  const headerLines = lines.slice(0, separatorIndex + 1);
  let dataLines = lines
    .slice(separatorIndex + 1)
    .filter(line => line.trim() !== ''); // Filter empty lines

  // Sort data lines based on predefined step order
  dataLines.sort((a, b) => {
    const stepA = getStepName(a, emojiMap);
    const stepB = getStepName(b, emojiMap);
    const indexA = stepA ? buildSteps.indexOf(stepA) : -1;
    const indexB = stepB ? buildSteps.indexOf(stepB) : -1;

    // Handle cases where a step might not be in the predefined list
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });

  // Reconstruct the report
  report = headerLines.join('\n') + '\n' + dataLines.join('\n');

  // Add usage footer
  const usageData = readUsageData(packageDir);
  if (usageData) {
    report += `\n\n---\n**Total Usage:** Tokens: ${usageData.totalTokens} | Cost: $${usageData.totalCost.toFixed(4)}`;
  }

  // Ensure directory exists before writing
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, report);

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

  const lines = report.split('\n');
  const stepIndex = lines.findIndex(line => line.includes(step));
  let insertIndex = -1;

  if (stepIndex !== -1) {
    insertIndex = stepIndex;
    lines.splice(stepIndex, 1);
  } else {
    const separatorIndex = lines.findIndex(line => line.startsWith('|------'));
    if (separatorIndex !== -1) {
      insertIndex = separatorIndex + 1;
    } else {
      insertIndex = 3;
    }
  }

  lines.splice(insertIndex, 0, newRow);

  // Separate header/separator lines from data lines
  const separatorIndex = lines.findIndex(line => line.startsWith('|------'));
  const headerLines = lines.slice(0, separatorIndex + 1);
  let dataLines = lines
    .slice(separatorIndex + 1)
    .filter(line => line.trim() !== ''); // Filter empty lines

  // Sort data lines based on predefined step order
  dataLines.sort((a, b) => {
    const stepA = getStepName(a, emojiMap);
    const stepB = getStepName(b, emojiMap);
    const indexA = stepA ? docSteps.indexOf(stepA) : -1;
    const indexB = stepB ? docSteps.indexOf(stepB) : -1;

    // Handle cases where a step might not be in the predefined list
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });

  // Reconstruct the report
  report = headerLines.join('\n') + '\n' + dataLines.join('\n');

  // Add usage footer
  const usageData = readUsageData(packageDir);
  if (usageData) {
    report += `\n\n---\n**Total Usage:** Tokens: ${usageData.totalTokens} | Cost: $${usageData.totalCost.toFixed(4)}`;
  }

  // Ensure directory exists before writing
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, report);

  if (process.env.PR_NUMBER) {
    await prCommentor.createOrUpdateComment(
      {
        body: report,
      },
      'Packagefox: Documentation Report',
    );
  }
}
