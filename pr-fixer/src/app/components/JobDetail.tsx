"use client";

import { useEffect, useState } from "react";
import type { Job, PipelineStage } from "@/lib/types";
import DiffView from "./DiffView";

interface JobDetailProps {
  job: Job;
  onClose: () => void;
}

export default function JobDetail({ job: initialJob, onClose }: JobDetailProps) {
  const [job, setJob] = useState<Job>(initialJob);

  useEffect(() => {
    setJob(initialJob);
  }, [initialJob]);

  // Poll for updates if job is still active
  useEffect(() => {
    const isActive =
      job.status !== "pushed" &&
      job.status !== "escalated" &&
      job.status !== "failed";
    if (!isActive) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${job.id}`);
        const updated = await res.json();
        if (updated.stages) {
          setJob(updated);
        }
      } catch {
        // ignore
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [job.id, job.status]);

  const duration = job.completedAt
    ? Math.round(
        (new Date(job.completedAt).getTime() - new Date(job.createdAt).getTime()) /
          1000
      )
    : Math.round(
        (Date.now() - new Date(job.createdAt).getTime()) / 1000
      );

  return (
    <>
      <div className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-4 md:inset-x-12 md:inset-y-8 z-30 bg-surface border border-surface-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border bg-surface-raised">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-white truncate">
              {job.prName}
            </h2>
            <p className="text-sm text-gray-500">
              {job.repo} • PR #{job.prNumber} • {duration}s
            </p>
          </div>
          <div className="flex items-center gap-3">
            {job.errorType && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-surface-overlay text-gray-300 border border-surface-border">
                {job.errorType.replace("_", " ")}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-200 hover:bg-surface-hover rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Pipeline Timeline
            </h3>
            <div className="space-y-0">
              {job.stages.map((stage, i) => (
                <StageRow key={i} stage={stage} index={i} isLast={i === job.stages.length - 1} />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {job.errorMessage && (
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Error
              </h3>
              <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-sm text-red-300 font-mono">
                {job.errorMessage}
              </div>
            </div>
          )}

          {/* Diff */}
          {job.diff && (
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Generated Fix
              </h3>
              <DiffView diff={job.diff} />
            </div>
          )}

          {/* Error Log */}
          {job.errorLog && (
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
                CI Log (raw)
              </h3>
              <pre className="p-3 bg-[#0a0c12] rounded-lg text-xs text-gray-400 font-mono overflow-x-auto max-h-48">
                {job.errorLog.slice(0, 1000)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StageRow({ stage, index, isLast }: { stage: PipelineStage; index: number; isLast: boolean }) {
  const stageIcons: Record<string, string> = {
    detected: "🔍",
    sandboxing: "📦",
    diagnosing: "🩺",
    patching: "🔧",
    verifying: "✅",
    pushing: "🚀",
    pushed: "🚀",
    escalated: "⚠️",
    failed: "❌",
  };

  const statusColors: Record<string, string> = {
    running: "text-blue-400",
    completed: "text-emerald-400",
    failed: "text-red-400",
    skipped: "text-gray-500",
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-surface-overlay border border-surface-border flex items-center justify-center text-sm">
          {stageIcons[stage.name] || "•"}
        </div>
        {!isLast && <div className="w-px flex-1 bg-surface-border my-1" />}
      </div>
      <div className="flex-1 pb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-200 capitalize">
            {stage.name}
          </span>
          <span className={`text-xs font-medium ${statusColors[stage.status] || "text-gray-400"}`}>
            {stage.status}
          </span>
        </div>
        {stage.details && (
          <pre className="mt-1 text-xs text-gray-400 font-mono whitespace-pre-wrap leading-relaxed">
            {stage.details}
          </pre>
        )}
        <div className="text-xs text-gray-600 mt-1">
          {new Date(stage.startedAt).toLocaleTimeString()}
          {stage.completedAt &&
            ` → ${new Date(stage.completedAt).toLocaleTimeString()}`}
        </div>
      </div>
    </div>
  );
}
