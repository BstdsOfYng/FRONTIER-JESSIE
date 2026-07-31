"use client";

import { useEffect, useState } from "react";
import type { JobStats } from "@/lib/types";

export default function StatBar() {
  const [stats, setStats] = useState<JobStats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        setStats(data.stats);
      } catch {
        // silently fail
      }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  function formatTime(ms: number): string {
    if (ms === 0) return "—";
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  }

  const total = stats ? stats.totalToday : 0;
  const avgTime = stats ? formatTime(stats.avgTimeToFixMs) : "—";
  const resolveRate = stats ? Math.round(stats.autoResolveRate * 100) : 0;
  const resolved = stats ? stats.autoResolved : 0;
  const escalated = stats ? stats.escalated : 0;

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        label="Jobs Today"
        value={total}
        color="from-blue-500/20 to-blue-600/10"
        border="border-blue-500/30"
      />
      <StatCard
        label="Avg Time to Fix"
        value={avgTime}
        color="from-purple-500/20 to-purple-600/10"
        border="border-purple-500/30"
      />
      <StatCard
        label="Auto-Resolved"
        value={`${resolveRate}%`}
        sub={`${resolved} jobs`}
        color="from-emerald-500/20 to-emerald-600/10"
        border="border-emerald-500/30"
      />
      <StatCard
        label="Escalated"
        value={escalated}
        sub={total > 0 ? `${Math.round((escalated / total) * 100)}%` : "—"}
        color="from-red-500/20 to-red-600/10"
        border="border-red-500/30"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
  border,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  border: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br ${color} ${border} border rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:brightness-110`}
    >
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}
