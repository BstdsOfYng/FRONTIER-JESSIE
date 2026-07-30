"use client";

import { useEffect, useState, useCallback } from "react";
import type { IntegrationInfo, IntegrationStatus } from "@/lib/types";
import { parseGitHubLink, toRepoConfig } from "@/lib/github-url";

export default function SettingsPanel({
  onRepoConfigured,
}: {
  onRepoConfigured?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationInfo | null>(null);
  const [pollerState, setPollerState] = useState<any>(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [repoOwner, setRepoOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [configMsg, setConfigMsg] = useState("");
  const [tab, setTab] = useState<"integrations" | "repo">("integrations");

  const fetchData = useCallback(async () => {
    try {
      const [intRes, pollRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/poller/status"),
      ]);
      setIntegrations(await intRes.json());
      const ps = await pollRes.json();
      setPollerState(ps);
      if (ps.repo) {
        setRepoOwner(ps.repo.owner);
        setRepoName(ps.repo.name);
        setRepoUrl("https://github.com/" + ps.repo.fullName);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!open) return;
    fetchData();
  }, [open, fetchData]);

  const handleUrlChange = useCallback((url: string) => {
    setRepoUrl(url);
    const parsed = parseGitHubLink(url);
    if (parsed) {
      const cfg = toRepoConfig(parsed);
      setRepoOwner(cfg.owner);
      setRepoName(cfg.name);
    }
  }, []);

  const configureRepo = useCallback(async (autoStart?: boolean) => {
    const body: Record<string, string> = {};
    if (repoOwner) body.owner = repoOwner;
    if (repoName) body.name = repoName;
    if (githubToken) body.token = githubToken;
    try {
      const res = await fetch("/api/github/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setConfigMsg(data.repo ? "Connected: " + data.repo : data.error || "Configured");
      await fetchData();

      // Auto-start polling if requested
      if (autoStart && data.repo) {
        await fetch("/api/poller/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "start" }),
        });
        await fetchData();
      }
      onRepoConfigured?.();
    } catch (err) {
      setConfigMsg("Error: " + String(err));
    }
  }, [repoOwner, repoName, githubToken, fetchData, onRepoConfigured]);

  const togglePoller = useCallback(async (action: "start" | "stop") => {
    try {
      const res = await fetch("/api/poller/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      setPollerState((prev: any) => ({ ...prev, ...data }));
    } catch {}
  }, []);

  const parsed = parseGitHubLink(repoUrl);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-200 hover:bg-surface-hover rounded-lg transition-all text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Settings
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="fixed right-4 top-20 w-96 z-40 bg-surface-overlay border border-surface-border rounded-xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="px-5 py-4 border-b border-surface-border flex-shrink-0">
              <div className="text-sm font-semibold text-gray-200">Settings</div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setTab("integrations")} className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-colors " + (tab === "integrations" ? "bg-accent text-white" : "bg-surface-hover text-gray-400 hover:text-gray-200")}>Integrations</button>
                <button onClick={() => setTab("repo")} className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-colors " + (tab === "repo" ? "bg-accent text-white" : "bg-surface-hover text-gray-400 hover:text-gray-200")}>Repository</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {tab === "integrations" && (
                <div className="space-y-3">
                  <IntegrationRow name="GitHub" status={integrations?.github || "mocked"} envVar="GITHUB_TOKEN" />
                  <IntegrationRow name="E2B Sandbox" status={integrations?.e2b || "mocked"} envVar="E2B_API_KEY" />
                  <IntegrationRow name="LLM (Gemini)" status={integrations?.llm || "mocked"} envVar="LLM_API_KEY / GEMINI_API_KEY" />
                  <IntegrationRow name="Webhook Secret" status={"not_configured"} envVar="WEBHOOK_SECRET" />
                  <div className="pt-2 text-xs text-gray-500">
                    {integrations && Object.values(integrations).every((v: any) => v === "mocked") ? "All integrations in demo mode - no API keys needed." : "Some live integrations detected."}
                  </div>
                </div>
              )}

              {tab === "repo" && (
                <div className="space-y-4">
                  {/* Repo URL input */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">GitHub Repo URL</label>
                    <div className="relative">
                      <input
                        value={repoUrl}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        placeholder="https://github.com/owner/repo"
                        className="w-full px-3 py-2.5 bg-surface-raised border border-surface-border rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent pr-10"
                      />
                      {parsed && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {parsed && (
                      <div className="mt-1.5 text-xs text-emerald-400">
                        Parsed: {parsed.owner}/{parsed.name}
                      </div>
                    )}
                    {repoUrl && !parsed && (
                      <div className="mt-1.5 text-xs text-red-400">
                        Invalid URL. Use https://github.com/owner/repo
                      </div>
                    )}
                  </div>

                  {/* Token input - only shown when needed */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">GitHub Token {!integrations?.github || integrations.github === "mocked" ? "(required for API access)" : ""}</label>
                    <input
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      type="password"
                      placeholder={process.env.GITHUB_TOKEN ? "Token set via env" : "ghp_..."}
                      className="w-full px-3 py-2.5 bg-surface-raised border border-surface-border rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent"
                    />
                  </div>

                  {/* Quick actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => configureRepo(false)}
                      disabled={!parsed}
                      className="px-3 py-2.5 bg-surface-hover hover:bg-surface-border text-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-surface-border"
                    >
                      Connect Only
                    </button>
                    <button
                      onClick={() => configureRepo(true)}
                      disabled={!parsed}
                      className="px-3 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Connect & Start Scan
                    </button>
                  </div>

                  {configMsg && <div className="text-xs text-gray-400 bg-surface-raised p-2 rounded">{configMsg}</div>}

                  {/* Poller Status */}
                  <div className="border-t border-surface-border pt-4">
                    <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">Auto Poller</div>
                    {pollerState && (
                      <div className="space-y-2 text-xs text-gray-400">
                        <div className="flex justify-between"><span>Status</span><span className={pollerState.running ? "text-emerald-400" : "text-gray-500"}>{pollerState.running ? "Running" : "Stopped"}</span></div>
                        <div className="flex justify-between"><span>Repo</span><span className="truncate max-w-[180px]">{pollerState.repo?.fullName || "Not set"}</span></div>
                        <div className="flex justify-between"><span>Interval</span><span>{pollerState.intervalSec || 30}s</span></div>
                        <div className="flex justify-between"><span>Last Scan</span><span>{pollerState.lastScanAt ? new Date(pollerState.lastScanAt).toLocaleTimeString() : "N/A"}</span></div>
                        <div className="flex justify-between"><span>PRs Checked</span><span>{pollerState.checkedPRs || 0}</span></div>
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      {pollerState?.running ? (
                        <button onClick={() => togglePoller("stop")} className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-colors">Stop Polling</button>
                      ) : (
                        <button onClick={() => togglePoller("start")} disabled={!pollerState?.repo} className="flex-1 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Start Polling</button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function IntegrationRow({ name, status, envVar }: { name: string; status: IntegrationStatus; envVar: string }) {
  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    live: { color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Live" },
    mocked: { color: "text-amber-400", bg: "bg-amber-500/10", label: "Mocked" },
    not_configured: { color: "text-gray-500", bg: "bg-gray-500/10", label: "Not Configured" },
  };
  const cfg = statusConfig[status] || statusConfig.not_configured;
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-raised border border-surface-border">
      <div><div className="text-sm font-medium text-gray-200">{name}</div><div className="text-xs text-gray-500 mt-0.5">{envVar}</div></div>
      <span className={"text-xs font-medium px-2.5 py-1 rounded-full " + cfg.color + " " + cfg.bg}>{cfg.label}</span>
    </div>
  );
}
