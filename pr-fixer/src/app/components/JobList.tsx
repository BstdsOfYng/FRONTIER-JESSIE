"use client";

import { useEffect, useState } from "react";
import type { Job } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  detected: "bg-status-detected",
  sandboxing: "bg-status-sandboxing",
  diagnosing: "bg-status-diagnosing",
  patching: "bg-status-patching",
  verifying: "bg-status-verifying",
  pushed: "bg-status-pushed",
  escalated: "bg-status-escalated",
  failed: "bg-status-failed",
};

const STATUS_LABELS: Record<string, string> = {
  detected: "Detected",
  sandboxing: "Sandboxing",
  diagnosing: "Diagnosing",
  patching: "Patching",
  verifying: "Verifying",
  pushed: "Pushed \u2713",
  escalated: "Escalated \u26a0",
  failed: "Failed \u2717",
};

interface JobListProps {
  selectedId: string | null;
  onSelectJob: (job: Job) => void;
  refreshKey: number;
}

export default function JobList({ selectedId, onSelectJob, refreshKey }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
    const interval = setInterval(fetchJobs, 2000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-12 h-12 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500 text-sm">No jobs yet</p>
        <p className="text-gray-600 text-xs mt-1">
          Click &quot;Simulate Failing PR&quot; to start a pipeline
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {jobs.map((job) => {
        const isActive =
          job.status !== "pushed" &&
          job.status !== "escalated" &&
          job.status !== "failed";
        const isSelected = job.id === selectedId;

        return (
          <button
            key={job.id}
            onClick={() => onSelectJob(job)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
              isSelected
                ? "bg-accent/10 border-accent/40 shadow-md"
                : "bg-surface-raised border-surface-border hover:bg-surface-hover hover:border-gray-600"
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-200 truncate">
                  {job.prName}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {job.repo} &bull; PR #{job.prNumber}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  STATUS_COLORS[job.status]
                } bg-opacity-15 text-white`}
                style={{ backgroundColor: "currentcolor" }}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? "pulse-dot" : ""
                  }`}
                  style={{ backgroundColor: "currentcolor" }}
                />
                {STATUS_LABELS[job.status] || job.status}
              </span>

              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        );
      })}
    </div>
  );
}
