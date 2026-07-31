"use client";

import { useState, useCallback, useEffect } from "react";
import type { Job } from "@/lib/types";
import StatBar from "./components/StatBar";
import JobList from "./components/JobList";
import JobDetail from "./components/JobDetail";
import SimulateButton from "./components/SimulateButton";
import SettingsPanel from "./components/SettingsPanel";
import PrInput from "./components/PrInput";

export default function Home() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pollerStatus, setPollerStatus] = useState<any>(null);

  useEffect(() => {
    fetch("/api/poller/status")
      .then((r) => r.json())
      .then(setPollerStatus)
      .catch(() => {});
    const interval = setInterval(() => {
      fetch("/api/poller/status")
        .then((r) => r.json())
        .then(setPollerStatus)
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulationStart = useCallback((jobId: string) => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleSelectJob = useCallback((job: Job) => {
    setSelectedJob(job);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedJob(null);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Top Navigation */}
      <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-xl border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-muted flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">PR Fixer</h1>
                <p className="text-xs text-gray-500 -mt-0.5">Self-Healing CI/CD Agent</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Poller status indicator */}
              {pollerStatus?.running && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
                  <span className="text-xs text-emerald-400">Scanning</span>
                  <span className="text-xs text-gray-500">{pollerStatus.checkedPRs} PRs</span>
                </div>
              )}
              <SettingsPanel />
              <SimulateButton onSimulationStart={handleSimulationStart} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* GitHub PR Link Input */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Quick Fix</h2>
            </div>
            <div className="flex-1 border-t border-surface-border" />
          </div>
          <div className="bg-surface-raised border border-surface-border rounded-xl p-5">
            <p className="text-xs text-gray-500 mb-3">
              Paste a GitHub Pull Request URL to automatically detect and fix failing CI checks.
            </p>
            <PrInput onJobCreated={handleSimulationStart} />
          </div>
        </section>

        {/* Stats Bar */}
        <section>
          <StatBar />
        </section>

        {/* Live PR Scanning Status */}
        {pollerStatus?.repo && (
          <section className="bg-surface-raised border border-surface-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Live Repository: {pollerStatus.repo.fullName}
              </h2>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className={pollerStatus.running ? "text-emerald-400" : "text-gray-500"}>
                  {pollerStatus.running ? "● Scanning every " + pollerStatus.intervalSec + "s" : "○ Stopped"}
                </span>
                {pollerStatus.lastScanAt && (
                  <span>Last scan: {new Date(pollerStatus.lastScanAt).toLocaleTimeString()}</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-surface-overlay border border-surface-border">
                <div className="text-xs text-gray-500">Status</div>
                <div className="text-sm font-medium text-gray-200 mt-0.5">{pollerStatus.running ? "Active" : "Inactive"}</div>
              </div>
              <div className="p-3 rounded-lg bg-surface-overlay border border-surface-border">
                <div className="text-xs text-gray-500">PRs Checked</div>
                <div className="text-sm font-medium text-gray-200 mt-0.5">{pollerStatus.checkedPRs || 0}</div>
              </div>
              <div className="p-3 rounded-lg bg-surface-overlay border border-surface-border">
                <div className="text-xs text-gray-500">Interval</div>
                <div className="text-sm font-medium text-gray-200 mt-0.5">{pollerStatus.intervalSec || 30}s</div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              {pollerStatus.githubConfigured
                ? "GitHub API is connected. The poller will automatically create fix jobs for failing PRs."
                : "GitHub not configured. Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO env vars, or use the Settings panel."}
            </p>
          </section>
        )}

        {/* Jobs Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Pipeline Jobs</h2>
            <span className="text-xs text-gray-600">Auto-refreshes every 2s</span>
          </div>
          <JobList selectedId={selectedJob?.id || null} onSelectJob={handleSelectJob} refreshKey={refreshKey} />
        </section>
      </main>

      {selectedJob && <JobDetail job={selectedJob} onClose={handleCloseDetail} />}
    </div>
  );
}
