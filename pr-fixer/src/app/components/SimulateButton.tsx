"use client";

import { useState, useCallback } from "react";
import type { ErrorType } from "@/lib/types";

interface SimulateButtonProps {
  onSimulationStart: (jobId: string) => void;
  disabled?: boolean;
}

export default function SimulateButton({ onSimulationStart, disabled }: SimulateButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const simulate = useCallback(
    async (errorType: ErrorType) => {
      setLoading(true);
      setOpen(false);
      try {
        const res = await fetch("/api/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ errorType }),
        });
        const data = await res.json();
        if (data.jobId) {
          onSimulationStart(data.jobId);
        }
      } catch (err) {
        console.error("Simulation failed", err);
      } finally {
        setLoading(false);
      }
    },
    [onSimulationStart]
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled || loading}
        className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Simulating...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Simulate Failing PR
          </>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 z-20 bg-surface-overlay border border-surface-border rounded-xl shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-surface-border">
              <div className="text-sm font-semibold text-gray-200">Choose failure type</div>
              <div className="text-xs text-gray-500 mt-0.5">The pipeline will auto-fix it</div>
            </div>
            <div className="p-1">
              <OptionButton
                label="Lint Error"
                desc="ESLint no-multi-spaces violation"
                color="text-amber-400"
                onClick={() => simulate("lint")}
              />
              <OptionButton
                label="Type Error"
                desc="TypeScript TS2322 type mismatch"
                color="text-purple-400"
                onClick={() => simulate("type_error")}
              />
              <OptionButton
                label="Failing Unit Test"
                desc="Jest assertion failure"
                color="text-rose-400"
                onClick={() => simulate("failing_test")}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function OptionButton({
  label,
  desc,
  color,
  onClick,
}: {
  label: string;
  desc: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors text-left"
    >
      <div className={`mt-0.5 ${color}`}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="6" />
        </svg>
      </div>
      <div>
        <div className="text-sm font-medium text-gray-200">{label}</div>
        <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
      </div>
    </button>
  );
}
