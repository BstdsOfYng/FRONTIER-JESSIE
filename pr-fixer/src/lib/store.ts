import { Job, JobStats, JobStatus } from "./types";

const jobs = new Map<string, Job>();

let idCounter = 0;

function generateId(): string {
  idCounter++;
  const ts = Date.now().toString(36);
  return `job_${ts}_${idCounter}`;
}

export function createJob(params: {
  prName: string;
  repo: string;
  prNumber: number;
  branch: string;
  errorType?: Job["errorType"];
  errorMessage?: string;
  errorLog?: string;
}): Job {
  const job: Job = {
    id: generateId(),
    prName: params.prName,
    repo: params.repo,
    prNumber: params.prNumber,
    branch: params.branch,
    status: "detected",
    errorType: params.errorType,
    errorMessage: params.errorMessage,
    errorLog: params.errorLog,
    fixAttempts: 0,
    maxAttempts: 5,
    stages: [
      {
        name: "detected",
        status: "completed",
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        details: "Job created and failure detected",
      },
    ],
    createdAt: new Date().toISOString(),
  };
  jobs.set(job.id, job);
  return job;
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function getAllJobs(): Job[] {
  return Array.from(jobs.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function updateJobStatus(id: string, status: JobStatus): Job | undefined {
  const job = jobs.get(id);
  if (!job) return undefined;
  job.status = status;
  if (status === "pushed" || status === "escalated" || status === "failed") {
    job.completedAt = new Date().toISOString();
  }
  return job;
}

export function addStage(id: string, stage: {
  name: string;
  status: "running" | "completed" | "failed" | "skipped";
  details?: string;
}): Job | undefined {
  const job = jobs.get(id);
  if (!job) return undefined;
  job.stages.push({
    name: stage.name,
    status: stage.status,
    startedAt: new Date().toISOString(),
    completedAt: stage.status === "running" ? undefined : new Date().toISOString(),
    details: stage.details,
  });
  return job;
}

export function updateStage(
  id: string,
  stageIndex: number,
  updates: Partial<{
    status: "running" | "completed" | "failed" | "skipped";
    details: string;
  }>
): Job | undefined {
  const job = jobs.get(id);
  if (!job || !job.stages[stageIndex]) return undefined;
  const stage = job.stages[stageIndex];
  if (updates.status) {
    stage.status = updates.status;
    if (updates.status !== "running") {
      stage.completedAt = new Date().toISOString();
    }
  }
  if (updates.details !== undefined) {
    stage.details = updates.details;
  }
  return job;
}

export function incrementFixAttempt(id: string): Job | undefined {
  const job = jobs.get(id);
  if (!job) return undefined;
  job.fixAttempts++;
  return job;
}

export function setDiff(id: string, diff: string): Job | undefined {
  const job = jobs.get(id);
  if (!job) return undefined;
  job.diff = diff;
  return job;
}

export function getStats(): JobStats {
  const allJobs = getAllJobs();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayJobs = allJobs.filter(
    (j) => new Date(j.createdAt).getTime() >= today.getTime()
  );

  const completedJobs = allJobs.filter(
    (j) => j.status === "pushed" || j.status === "escalated" || j.status === "failed"
  );

  const autoResolved = completedJobs.filter((j) => j.status === "pushed").length;
  const escalated = completedJobs.filter(
    (j) => j.status === "escalated" || j.status === "failed"
  ).length;

  let totalTimeMs = 0;
  let timeCount = 0;
  for (const j of completedJobs) {
    if (j.completedAt) {
      totalTimeMs +=
        new Date(j.completedAt).getTime() - new Date(j.createdAt).getTime();
      timeCount++;
    }
  }

  const avgTimeToFixMs = timeCount > 0 ? Math.round(totalTimeMs / timeCount) : 0;
  const totalResolved = autoResolved + escalated;
  const autoResolveRate = totalResolved > 0 ? autoResolved / totalResolved : 0;

  return {
    totalToday: todayJobs.length,
    avgTimeToFixMs,
    autoResolved,
    escalated,
    autoResolveRate,
  };
}
