export type ThemeMode = 'dark' | 'light';

export type AgentPersona = 'safe_linter' | 'aggressive_refactor' | 'security_patch' | 'autonomous_ci';

export interface MonitoredPRStatus {
  id: string;
  prNumber: number;
  repoOwner: string;
  repoName: string;
  title: string;
  branch: string;
  author: string;
  status: 'queued' | 'reproducing' | 'analyzing' | 'iterating' | 'passing' | 'failed';
  attempt: number;
  maxAttempts: number;
  progressPercent: number;
  activeStep: string;
  timeElapsedSeconds: number;
  etaSeconds?: number;
  lastUpdated: string;
}

export interface WebhookEvent {
  id: string;
  timestamp: string;
  event: 'pull_request' | 'check_run' | 'workflow_run' | 'custom';
  action: string;
  repository: {
    name: string;
    owner: string;
    fullName: string;
    defaultBranch: string;
  };
  pullRequest: {
    number: number;
    title: string;
    branch: string;
    author: string;
    url: string;
    diffUrl: string;
  };
  checkRun?: {
    name: string;
    status: string;
    conclusion: 'failure' | 'success' | 'neutral';
    detailsUrl?: string;
  };
  rawPayload: string;
  processed: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'cmd' | 'error' | 'success' | 'ai' | 'sandbox';
  message: string;
  details?: string;
}

export interface ErrorDetails {
  failingTestFile: string;
  testName: string;
  errorMessage: string;
  stackTrace: string;
  rawLogSnippet: string;
}

export interface SandboxRun {
  id: string;
  webhookId: string;
  scenarioId?: string;
  repoOwner: string;
  repoName: string;
  prNumber: number;
  branch: string;
  status: 'queued' | 'reproducing' | 'analyzing' | 'patching' | 'verifying' | 'resolved' | 'failed';
  logs: LogEntry[];
  errorDetails?: ErrorDetails;
  filename?: string;
  originalCode?: string;
  patchedCode?: string;
  diff?: string;
  attempts: number;
  maxAttempts: number;
  tokensUsed: number;
  executionTimeMs: number;
  prCommentUrl?: string;
  commitSha?: string;
  rootCauseSummary?: string;
  fixExplanation?: string;
  pushedToGithub?: boolean;
}

export interface PresetScenario {
  id: string;
  title: string;
  description: string;
  category: 'Jest Unit Test Failure' | 'TypeScript Type Mismatch' | 'ESLint Syntax Error' | 'Pytest Assertion Failure';
  repoOwner: string;
  repoName: string;
  prNumber: number;
  prTitle: string;
  branch: string;
  author: string;
  filename: string;
  buggyCode: string;
  failingTestCode: string;
  errorMessage: string;
  stackTrace: string;
}

export interface AgentSettings {
  maxAttempts: number;
  maxFilesModified: number;
  tokenBudget: number;
  autoCommitAndPush: boolean;
  onlyDeterministicTests: boolean;
  githubToken?: string;
  webhookSecret?: string;
  persona?: AgentPersona;
  confidenceThreshold?: number;
  autoFixCVEs?: boolean;
  soundFxEnabled?: boolean;
}
