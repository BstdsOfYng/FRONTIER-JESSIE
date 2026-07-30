export type JobStatus =
  | "detected"
  | "sandboxing"
  | "diagnosing"
  | "patching"
  | "verifying"
  | "pushed"
  | "escalated"
  | "failed";

export type ErrorType = "lint" | "type_error" | "failing_test";

export type IntegrationStatus = "live" | "mocked" | "not_configured";

export interface PipelineStage {
  name: string;
  status: "running" | "completed" | "failed" | "skipped";
  startedAt: string;
  completedAt?: string;
  details?: string;
}

export interface Job {
  id: string;
  prName: string;
  repo: string;
  prNumber: number;
  branch: string;
  status: JobStatus;
  errorType?: ErrorType;
  errorMessage?: string;
  errorLog?: string;
  diff?: string;
  fixAttempts: number;
  maxAttempts: number;
  stages: PipelineStage[];
  createdAt: string;
  completedAt?: string;
  commitUrl?: string;
  prCommentUrl?: string;
}

export interface JobStats {
  totalToday: number;
  avgTimeToFixMs: number;
  autoResolved: number;
  escalated: number;
  autoResolveRate: number;
}

export interface IntegrationInfo {
  github: IntegrationStatus;
  e2b: IntegrationStatus;
  llm: IntegrationStatus;
}

export interface SimulateRequest {
  errorType: ErrorType;
  repo?: string;
  branch?: string;
  prNumber?: number;
}

export interface GitHubPR {
  number: number;
  title: string;
  body: string | null;
  head: { ref: string; sha: string };
  base: { ref: string };
  state: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  user: { login: string };
}

export interface CheckRun {
  id: number;
  name: string;
  status: "queued" | "in_progress" | "completed";
  conclusion: string | null;
  started_at: string;
  completed_at: string | null;
  output: { title: string; summary: string; text: string | null };
}

export interface PRCheckStatus {
  pr: GitHubPR;
  overall: "success" | "failure" | "pending" | "neutral" | "unknown";
  checkRuns: CheckRun[];
  failureLogs?: string;
}

export interface RepoConfig {
  owner: string;
  name: string;
  fullName: string;
}

export interface PollerState {
  running: boolean;
  repo: RepoConfig | null;
  intervalSec: number;
  lastScanAt: string | null;
  checkedPRs: number;
}
