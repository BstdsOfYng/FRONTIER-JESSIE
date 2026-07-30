"use client";

import { useState, useCallback, useRef } from "react";
import { parseGitHubLink } from "@/lib/github-url";

interface PRResult {
  jobId?: string;
  status: string;
  pr?: {
    number: number;
    title: string;
    url: string;
    overall?: string;
  };
  repo?: string;
  message?: string;
  error?: string;
}

interface PrInputProps {
  onJobCreated?: (jobId: string) => void;
}

export default function PrInput({ onJobCreated }: PrInputProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PRResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!url.trim() || loading) return;

      setLoading(true);
      setResult(null);
      setShowResult(false);

      try {
        const res = await fetch("/api/github/pr-from-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: url.trim() }),
        });
        const data: PRResult = await res.json();
        setResult(data);
        setShowResult(true);

        if (data.jobId) {
          onJobCreated?.(data.jobId);
        }

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setShowResult(false), 10000);
      } catch (err) {
        setResult({
          status: "error",
          error: "Network error: " + (err instanceof Error ? err.message : String(err)),
        });
        setShowResult(true);
      } finally {
        setLoading(false);
      }
    },
    [url, loading, onJobCreated]
  );

  const handleClear = useCallback(() => {
    setUrl("");
    setResult(null);
    setShowResult(false);
    inputRef.current?.focus();
  }, []);

  const isValidUrl = url.trim().length > 0 && parseGitHubLink(url.trim()) !== null;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className={"w-5 h-5 transition-colors duration-200 " + (loading ? "text-accent" : isValidUrl ? "text-emerald-400" : "text-gray-600")}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (showResult) setShowResult(false);
            }}
            placeholder="Paste a GitHub PR link... (e.g. https://github.com/owner/repo/pull/123)"
            className="w-full pl-12 pr-28 py-3.5 bg-surface-raised border border-surface-border rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all duration-200"
            disabled={loading}
            autoComplete="off"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {url && !loading && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-surface-hover rounded-md transition-colors"
                title="Clear"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            <button
              type="submit"
              disabled={!isValidUrl || loading}
              className={
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 " +
                (loading
                  ? "bg-accent/50 text-white/70 cursor-wait"
                  : isValidUrl
                    ? "bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20"
                    : "bg-surface-hover text-gray-500 cursor-not-allowed")
              }
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Fix It
                </>
              )}
            </button>
          </div>
        </div>

        {!url && !showResult && (
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
            <span>Try:</span>
            <button
              type="button"
              onClick={() => setUrl("https://github.com/facebook/react/pull/123")}
              className="px-2 py-0.5 rounded bg-surface-hover hover:bg-surface-border text-gray-500 hover:text-gray-300 transition-colors"
            >
              facebook/react/pull/123
            </button>
            <button
              type="button"
              onClick={() => setUrl("https://github.com/vercel/next.js/pull/456")}
              className="px-2 py-0.5 rounded bg-surface-hover hover:bg-surface-border text-gray-500 hover:text-gray-300 transition-colors"
            >
              vercel/next.js/pull/456
            </button>
          </div>
        )}
      </form>

      {showResult && result && (
        <div
          className={
            "mt-3 p-4 rounded-xl border transition-all duration-300 animate-in slide-in-from-top-2 " +
            (result.status === "job_created"
              ? "bg-emerald-500/10 border-emerald-500/30"
              : result.status === "no_issues"
                ? "bg-blue-500/10 border-blue-500/30"
                : result.status === "repo_configured"
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-red-500/10 border-red-500/30")
          }
        >
          <div className="flex items-start gap-3">
            <div
              className={
                "mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center " +
                (result.status === "job_created"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : result.status === "no_issues"
                    ? "bg-blue-500/20 text-blue-400"
                    : result.status === "repo_configured"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-red-500/20 text-red-400")
              }
            >
              {result.status === "job_created" ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : result.status === "no_issues" ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : result.status === "repo_configured" ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p
                    className={
                      "text-sm font-semibold " +
                      (result.status === "job_created"
                        ? "text-emerald-300"
                        : result.status === "no_issues"
                          ? "text-blue-300"
                          : result.status === "repo_configured"
                            ? "text-amber-300"
                            : "text-red-300")
                    }
                  >
                    {result.status === "job_created"
                      ? "Fix Pipeline Started"
                      : result.status === "no_issues"
                        ? "No Issues Found"
                        : result.status === "repo_configured"
                          ? "Repo Configured"
                          : "Error"}
                  </p>
                  {result.pr && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {result.pr.title || "PR #" + result.pr.number}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowResult(false)}
                  className="p-1 text-gray-500 hover:text-gray-300 rounded transition-colors flex-shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                {result.message || result.error}
              </p>

              {result.repo && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-hover border border-surface-border text-gray-400">
                    {result.repo}
                  </span>
                  {result.pr && result.pr.number && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface-hover border border-surface-border text-gray-400">
                      PR #{result.pr.number}
                    </span>
                  )}
                  {result.pr?.overall && (
                    <span
                      className={
                        "text-xs px-2 py-0.5 rounded-full border " +
                        (result.pr.overall === "success"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-red-500/10 border-red-500/30 text-red-400")
                      }
                    >
                      {result.pr.overall}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
