import { getRepoConfig, listOpenPRs, getPRStatus, determineErrorTypeFromLog } from "./github";
import { createJob } from "./store";
import { runPipeline } from "./pipeline";
import type { GitHubPR, RepoConfig } from "./types";

let intervalId: ReturnType<typeof setInterval> | null = null;
let pollerState: {
  running: boolean;
  repo: RepoConfig | null;
  intervalSec: number;
  lastScanAt: string | null;
  checkedPRs: number;
} = { running: false, repo: null, intervalSec: 30, lastScanAt: null, checkedPRs: 0 };

function dedup(prs: GitHubPR[]): GitHubPR[] {
  const seen: Record<number, boolean> = {};
  return prs.filter(function(p: GitHubPR) {
    if (seen[p.number]) return false;
    seen[p.number] = true;
    return true;
  });
}

async function scanPRs(repo: RepoConfig): Promise<void> {
  try {
    const prs = await listOpenPRs(repo);
    const unique = dedup(prs);
    for (let i = 0; i < unique.length; i++) {
      const pr = unique[i];
      try {
        const status = await getPRStatus(repo, pr);
        if (status.overall === "failure") {
          const parsed = determineErrorTypeFromLog(status.failureLogs || "");
          const job = createJob({
            prName: pr.title,
            repo: repo.fullName,
            prNumber: pr.number,
            branch: pr.head.ref,
            errorType: parsed.errorType,
            errorMessage: parsed.errorMessage,
            errorLog: status.failureLogs,
          });
          runPipeline(job.id).catch(function(e: Error) {
            console.error("Pipeline " + job.id + " failed: " + e);
          });
          pollerState.checkedPRs++;
        }
      } catch (e) {
        console.error("Error checking PR #" + pr.number + ": " + e);
      }
    }
    pollerState.lastScanAt = new Date().toISOString();
  } catch (e) {
    console.error("PR scan failed: " + e);
  }
}

export function startPolling(repo: RepoConfig, intervalSec?: number): void {
  stopPolling();
  pollerState.repo = repo;
  pollerState.intervalSec = intervalSec || 30;
  pollerState.running = true;
  scanPRs(repo);
  intervalId = setInterval(function() { scanPRs(repo); }, pollerState.intervalSec * 1000);
}

export function stopPolling(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  pollerState.running = false;
}

export function getPollerState(): typeof pollerState {
  return { ...pollerState };
}

export function startPollerFromEnv(): void {
  const repo = getRepoConfig();
  if (repo && !pollerState.running) {
    startPolling(repo, 30);
  }
}
