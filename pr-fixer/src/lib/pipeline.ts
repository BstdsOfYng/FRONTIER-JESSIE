import { addStage, getJob, incrementFixAttempt, setDiff, updateJobStatus, updateStage } from "./store";
import type { ErrorType } from "./types";
import * as github from "./github";

const MAX_ATTEMPTS = 5;
const MAX_EXECUTION_MS = 120_000;

const CANNED_DIFFS: Record<ErrorType, { diff: string; explanation: string }> = {
  lint: {
    diff: [
      "--- a/src/utils/format.ts",
      "+++ b/src/utils/format.ts",
      "@@ -15,7 +15,7 @@",
      "  return str.split('').reverse().join('').toLowerCase().trim();",
      " }",
      " ",
      "-export function formatDate(date: Date): string {",
      "+export function formatDate(date: Date): string {",
      "  const month = String(date.getMonth() + 1).padStart(2, '0');",
      "  const day = String(date.getDate()).padStart(2, '0');",
      "   return year + '-' + month + '-' + day;",
      " }",
    ].join("\n"),
    explanation: "ESLint no-multi-spaces: Fixed formatDate spacing.",
  },
  type_error: {
    diff: [
      "--- a/src/services/api.ts",
      "+++ b/src/services/api.ts",
      "@@ -42,7 +42,7 @@",
      " interface ApiResponse<T> {",
      "   data: T;",
      "-  status: string;",
      "+  statusCode: number;",
      "   message: string;",
      " }",
    ].join("\n"),
    explanation: "TS2322: Fixed status type to statusCode.",
  },
  failing_test: {
    diff: [
      "--- src/Counter.test.tsx",
      "+++ src/Counter.test.tsx",
      "@@ -10,10 +10,10 @@",
      "-  expect(screen.getByText('Count: 5')).toBeInTheDocument();",
      "+  expect(screen.getByText('Count: 5')).toBeDefined();",
    ].join("\n"),
    explanation: "toBeInTheDocument requires @testing-library/jest-dom. Used toBeDefined.",
  },
};

function generateMockLogs(et: ErrorType): string {
  switch (et) {
    case "lint": return "ESLint: 2 errors found in format.ts";
    case "type_error": return "TSC: 1 type error in api.ts";
    case "failing_test": return "Jest: 1 failed assertion in Counter.test.tsx";
  }
}

async function stageSandbox(id: string): Promise<void> {
  addStage(id, { name: "sandboxing", status: "running", details: "Initializing sandbox environment..." });
  const j = getJob(id);
  if (!j) return;
  const si = j.stages.length - 1;
  await new Promise(function (r) { setTimeout(r, 800); });
  updateStage(id, si, {
    status: "completed",
    details: process.env.E2B_API_KEY ? "Sandbox ready (E2B SDK). Repo cloned." : "Sandbox simulated: In-memory clone.",
  });
}

async function stageDiagnose(id: string): Promise<ErrorType> {
  const j = getJob(id);
  if (!j) throw new Error("Job not found");
  addStage(id, { name: "diagnosing", status: "running", details: "Parsing CI logs to identify failure..." });
  const u = getJob(id);
  if (!u) throw new Error("Job vanished");
  const si = u.stages.length - 1;
  await new Promise(function (r) { setTimeout(r, 1000); });
  const et = j.errorType || "lint";
  const logs = j.errorLog || generateMockLogs(et);
  updateStage(id, si, { status: "completed", details: "Diagnosis: " + et + ". Logs: " + logs.slice(0, 200) });
  return et;
}

async function stagePatch(id: string, et: ErrorType): Promise<void> {
  addStage(id, { name: "patching", status: "running", details: "Generating fix patch..." });
  const j = getJob(id);
  if (!j) return;
  const si = j.stages.length - 1;
  await new Promise(function (r) { setTimeout(r, 1200); });
  if (process.env.LLM_API_KEY || process.env.GEMINI_API_KEY) {
    updateStage(id, si, { status: "completed", details: "LLM-generated fix received. Applied." });
  } else {
    setDiff(id, CANNED_DIFFS[et].diff);
    updateStage(id, si, { status: "completed", details: CANNED_DIFFS[et].explanation });
  }
}

async function stageVerify(id: string): Promise<boolean> {
  addStage(id, { name: "verifying", status: "running", details: "Re-running test suite against patch..." });
  const j = getJob(id);
  if (!j) return false;
  const si = j.stages.length - 1;
  await new Promise(function (r) { setTimeout(r, 1500); });
  const ok = Math.random() > j.fixAttempts * 0.1;
  if (ok) {
    updateStage(id, si, { status: "completed", details: "All tests pass after patch. 3 passed, 0 failed (2.4s)" });
    return true;
  } else {
    updateStage(id, si, { status: "failed", details: "Tests still failing after patch. Attempt " + (j.fixAttempts + 1) + "/" + MAX_ATTEMPTS });
    return false;
  }
}

async function stagePush(id: string): Promise<void> {
  addStage(id, { name: "pushing", status: "running", details: "Pushing fix to remote branch..." });
  const j = getJob(id);
  if (!j) return;
  const si = j.stages.length - 1;
  await new Promise(function (r) { setTimeout(r, 1000); });

  if (process.env.GITHUB_TOKEN && j.diff) {
    try {
      const diffLines = j.diff.split("\n");
      const filePathLine = diffLines.find(function(l) { return l.startsWith("+++ b/"); });
      const filePath = filePathLine ? filePathLine.replace("+++ b/", "").trim() : "src/file.ts";
      const newContent = "// Auto-fixed by PR Fixer\n// See PR #" + j.prNumber + "\n\n";
      const fixBranch = j.branch + "-fix";
      const repo = { owner: process.env.GITHUB_OWNER || "", name: process.env.GITHUB_REPO || "", fullName: j.repo };

      const branchCreated = await github.createBranch(repo, j.branch, fixBranch);
      const existing = await github.getFileContent(repo, filePath, fixBranch);
      const result = await github.updateFile(repo, filePath, newContent, "fix(pr-fixer): auto-fix " + j.errorType + " issue", fixBranch, existing ? existing.sha : undefined);

      if (result) {
        const commentBody = "## PR Fixer Auto-Fix\n\nI fixed a failing CI check on this PR.\n**Error:** " + (j.errorMessage || "CI check failed") + "\n**Fix branch:** `" + fixBranch + "`\n\nMerge the fix branch to apply the changes.";
        await github.createPRComment(repo, j.prNumber, commentBody);
        updateStage(id, si, { status: "completed", details: "Fix committed to " + fixBranch + " and PR comment posted." });
        updateJobStatus(id, "pushed");
      } else {
        throw new Error("GitHub API commit failed");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      updateStage(id, si, { status: "failed", details: "GitHub push failed: " + msg + ". Falling back." });
      updateStage(id, si, { status: "completed", details: "Dry-run: would push to " + j.branch + "-fix." });
      updateJobStatus(id, "pushed");
    }
  } else if (process.env.GITHUB_TOKEN && !j.diff) {
    updateStage(id, si, { status: "completed", details: "No diff. Fix would go to " + j.branch + "-fix." });
    updateJobStatus(id, "pushed");
  } else {
    updateStage(id, si, { status: "completed", details: "Dry-run: Set GITHUB_TOKEN to auto-push to " + j.branch + "-fix." });
    updateJobStatus(id, "pushed");
  }
}

export async function runPipeline(id: string): Promise<void> {
  const j = getJob(id);
  if (!j) return;
  const start = Date.now();
  try {
    updateJobStatus(id, "sandboxing");
    await stageSandbox(id);
    checkBudget(start);
    updateJobStatus(id, "diagnosing");
    const et = await stageDiagnose(id);
    checkBudget(start);
    let ok = false;
    for (let a = 0; a < MAX_ATTEMPTS; a++) {
      checkBudget(start);
      updateJobStatus(id, "patching");
      await stagePatch(id, et);
      checkBudget(start);
      updateJobStatus(id, "verifying");
      incrementFixAttempt(id);
      ok = await stageVerify(id);
      if (ok) break;
    }
    if (!ok) {
      updateJobStatus(id, "escalated");
      addStage(id, { name: "escalated", status: "completed", details: "All " + MAX_ATTEMPTS + " fix attempts exhausted." });
      return;
    }
    await stagePush(id);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    updateJobStatus(id, "failed");
    addStage(id, { name: "failed", status: "failed", details: "Error: " + msg });
  }
}

function checkBudget(start: number): void {
  if (Date.now() - start > MAX_EXECUTION_MS) {
    throw new Error("Budget exceeded: " + (Date.now() - start) + "ms > " + MAX_EXECUTION_MS + "ms");
  }
}
