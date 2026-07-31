import type { GitHubPR, CheckRun, PRCheckStatus, RepoConfig } from "./types";

const GITHUB_API = "https://api.github.com";

function getHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) h.Authorization = "Bearer " + token;
  return h;
}

export function isConfigured(): boolean {
  return !!process.env.GITHUB_TOKEN;
}

export function getRepoConfig(): RepoConfig | null {
  const o = process.env.GITHUB_OWNER;
  const n = process.env.GITHUB_REPO;
  if (o && n) return { owner: o, name: n, fullName: o + "/" + n };
  return null;
}

export async function listOpenPRs(repo: RepoConfig): Promise<GitHubPR[]> {
  const url = GITHUB_API + "/repos/" + repo.owner + "/" + repo.name + "/pulls?state=open&per_page=50";
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error("GitHub error: " + res.status);
  return res.json();
}

export async function getCheckRuns(repo: RepoConfig, ref: string): Promise<CheckRun[]> {
  const url = GITHUB_API + "/repos/" + repo.owner + "/" + repo.name + "/commits/" + ref + "/check-runs?per_page=50";
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) return [];
  const d = await res.json();
  return d.check_runs || [];
}

export async function getPRStatus(repo: RepoConfig, pr: GitHubPR): Promise<PRCheckStatus> {
  const runs = await getCheckRuns(repo, pr.head.sha);
  let overall: PRCheckStatus["overall"] = "unknown";
  let logs: string | undefined;

  if (runs.length > 0) {
    const failed = runs.filter(function(cr: CheckRun) {
      return cr.status === "completed" && cr.conclusion === "failure";
    });
    const running = runs.filter(function(cr: CheckRun) {
      return cr.status !== "completed";
    });
    if (failed.length > 0) {
      overall = "failure";
      const msgs = failed.map(function(cr: CheckRun) {
        return "Check " + cr.name + ": " + (cr.output?.title || "Failed");
      });
      logs = msgs.join("\n---\n");
    } else if (running.length > 0) {
      overall = "pending";
    } else {
      overall = "success";
    }
  }

  return { pr, overall, checkRuns: runs, failureLogs: logs };
}

export async function getFileContent(repo: RepoConfig, path: string, ref: string): Promise<{ content: string; sha: string } | null> {
  const url = GITHUB_API + "/repos/" + repo.owner + "/" + repo.name + "/contents/" + path + "?ref=" + ref;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) return null;
  const d = await res.json();
  if (d.type !== "file") return null;
  return { content: Buffer.from(d.content, "base64").toString(), sha: d.sha };
}

export async function updateFile(repo: RepoConfig, path: string, content: string, message: string, branch: string, sha?: string): Promise<{ commitUrl: string } | null> {
  if (!process.env.GITHUB_TOKEN) return null;
  const body: Record<string, any> = { message, content: Buffer.from(content).toString("base64"), branch };
  if (sha) body.sha = sha;
  const res = await fetch(GITHUB_API + "/repos/" + repo.owner + "/" + repo.name + "/contents/" + path, {
    method: "PUT",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return { commitUrl: (await res.json()).commit?.html_url || "" };
}

export async function createPRComment(repo: RepoConfig, prNumber: number, body: string): Promise<{ url: string } | null> {
  if (!process.env.GITHUB_TOKEN) return null;
  const res = await fetch(GITHUB_API + "/repos/" + repo.owner + "/" + repo.name + "/issues/" + prNumber + "/comments", {
    method: "POST",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) return null;
  return { url: (await res.json()).html_url || "" };
}

export async function createBranch(repo: RepoConfig, baseRef: string, newBranch: string): Promise<boolean> {
  if (!process.env.GITHUB_TOKEN) return false;
  const ru = GITHUB_API + "/repos/" + repo.owner + "/" + repo.name + "/git/ref/heads/" + baseRef;
  const rr = await fetch(ru, { headers: getHeaders() });
  if (!rr.ok) return false;
  const rd = await rr.json();
  if (!rd || !rd.object) return false;
  const cr = await fetch(GITHUB_API + "/repos/" + repo.owner + "/" + repo.name + "/git/refs", {
    method: "POST",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ ref: "refs/heads/" + newBranch, sha: rd.object.sha }),
  });
  return cr.status === 201;
}

export async function getCombinedStatus(repo: RepoConfig, ref: string): Promise<string> {
  const url = GITHUB_API + "/repos/" + repo.owner + "/" + repo.name + "/commits/" + ref + "/status";
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) return "unknown";
  return (await res.json()).state || "unknown";
}

export function determineErrorTypeFromLog(log: string): { errorType: "lint" | "type_error" | "failing_test"; errorMessage: string } {
  const l = log.toLowerCase();
  if (l.includes("eslint") || l.includes("lint")) return { errorType: "lint", errorMessage: "ESLint violation" };
  if (l.includes("typescript") || l.includes("tsc")) return { errorType: "type_error", errorMessage: "TypeScript error" };
  if (l.includes("jest") || l.includes("test")) return { errorType: "failing_test", errorMessage: "Test failure" };
  return { errorType: "lint", errorMessage: "CI check failed" };
}
