import React, { useState, useEffect } from 'react';
import {
  Activity,
  Play,
  Pause,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  Layers,
  ArrowUpRight,
  Sparkles,
  Terminal,
  Filter
} from 'lucide-react';
import { MonitoredPRStatus, ThemeMode } from '../types';

interface RealTimeStatusProps {
  theme?: ThemeMode;
  onSelectPR?: (prNumber: number) => void;
}

const INITIAL_MONITORED_PRS: MonitoredPRStatus[] = [
  {
    id: 'pr-1402',
    prNumber: 1402,
    repoOwner: 'facebook',
    repoName: 'react',
    title: 'Fix failing auth-middleware unit tests in dev environment',
    branch: 'fix/auth-middleware',
    author: 'dan_abramov',
    status: 'iterating',
    attempt: 2,
    maxAttempts: 3,
    progressPercent: 65,
    activeStep: 'E2B Sandbox: Rerunning Jest test runner after applying patch...',
    timeElapsedSeconds: 84,
    etaSeconds: 25,
    lastUpdated: 'Just now',
  },
  {
    id: 'pr-1398',
    prNumber: 1398,
    repoOwner: 'vercel',
    repoName: 'next.js',
    title: 'Resolve ESLint syntax violations in components/auth.tsx',
    branch: 'linter-clean-up',
    author: 'timneutkens',
    status: 'passing',
    attempt: 1,
    maxAttempts: 3,
    progressPercent: 100,
    activeStep: 'Hotfix commit a4f891b pushed & GitHub check suite green',
    timeElapsedSeconds: 42,
    lastUpdated: '2 mins ago',
  },
  {
    id: 'pr-1405',
    prNumber: 1405,
    repoOwner: 'nodejs',
    repoName: 'node',
    title: 'Fix memory leak in worker pool connection tear down',
    branch: 'worker-leak-patch',
    author: 'mcollina',
    status: 'analyzing',
    attempt: 1,
    maxAttempts: 3,
    progressPercent: 35,
    activeStep: 'Gemini 3.6 Flash: Analyzing stack trace & constructing diff patch...',
    timeElapsedSeconds: 28,
    etaSeconds: 45,
    lastUpdated: 'Just now',
  },
  {
    id: 'pr-1392',
    prNumber: 1392,
    repoOwner: 'prisma',
    repoName: 'prisma',
    title: 'Fix race condition during concurrent transaction commits',
    branch: 'fix-conn-race',
    author: 'janpio',
    status: 'failed',
    attempt: 3,
    maxAttempts: 3,
    progressPercent: 100,
    activeStep: 'Max retry attempts exhausted. Non-deterministic concurrency issue.',
    timeElapsedSeconds: 195,
    lastUpdated: '12 mins ago',
  }
];

export const RealTimeStatus: React.FC<RealTimeStatusProps> = ({ onSelectPR }) => {
  const [prs, setPrs] = useState<MonitoredPRStatus[]>(INITIAL_MONITORED_PRS);
  const [filter, setFilter] = useState<'all' | 'active' | 'passing' | 'failed'>('all');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);

  const isDark = true;

  // Live progress ticker simulation
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setPrs((prev) =>
        prev.map((pr) => {
          if (pr.status === 'passing' || pr.status === 'failed') {
            return pr;
          }

          const newElapsed = pr.timeElapsedSeconds + 1;
          let newProgress = pr.progressPercent + Math.floor(Math.random() * 4) + 1;
          let newStatus: MonitoredPRStatus['status'] = pr.status;
          let newStep = pr.activeStep;
          let newAttempt = pr.attempt;

          if (newProgress >= 100) {
            newProgress = 100;
            newStatus = 'passing';
            newStep = 'All tests passed! Hotfix commit verified and pushed.';
          } else if (newProgress > 75 && pr.status !== 'iterating') {
            newStatus = 'iterating';
            newStep = 'E2B Sandbox: Verifying patched build with test suite...';
          } else if (newProgress > 40 && pr.status === 'reproducing') {
            newStatus = 'analyzing';
            newStep = 'Gemini AI: Pinpointing root cause and generating patch...';
          }

          return {
            ...pr,
            timeElapsedSeconds: newElapsed,
            progressPercent: newProgress,
            status: newStatus,
            activeStep: newStep,
            attempt: newAttempt,
            lastUpdated: 'Just now',
          };
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  const handleRestartPR = (prId: string) => {
    setPrs((prev) =>
      prev.map((pr) => {
        if (pr.id === prId) {
          return {
            ...pr,
            status: 'reproducing',
            attempt: 1,
            progressPercent: 15,
            activeStep: 'E2B Sandbox: Cloning repository & reproducing build failure...',
            timeElapsedSeconds: 0,
            etaSeconds: 40,
            lastUpdated: 'Just now',
          };
        }
        return pr;
      })
    );
  };

  const filteredPrs = prs.filter((pr) => {
    if (filter === 'active') return pr.status !== 'passing' && pr.status !== 'failed';
    if (filter === 'passing') return pr.status === 'passing';
    if (filter === 'failed') return pr.status === 'failed';
    return true;
  });

  const activeCount = prs.filter((p) => p.status !== 'passing' && p.status !== 'failed').length;
  const passingCount = prs.filter((p) => p.status === 'passing').length;
  const totalCount = prs.length;

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const getStatusBadge = (status: MonitoredPRStatus['status']) => {
    switch (status) {
      case 'passing':
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isDark ? 'bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/30' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
          }`}>
            <CheckCircle2 className="w-3 h-3 text-[#4ade80]" />
            Passing & Pushed
          </span>
        );
      case 'failed':
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isDark ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            <AlertCircle className="w-3 h-3 text-red-400" />
            Budget Exhausted
          </span>
        );
      case 'iterating':
      case 'analyzing':
      case 'reproducing':
      case 'queued':
      default:
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-amber-100 text-amber-800 border border-amber-300'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            Active ({status})
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className={`p-6 rounded-xl border transition-colors shadow-2xl ${
        isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className={`w-5 h-5 ${isDark ? 'text-[#4ade80]' : 'text-emerald-600'} animate-pulse`} />
              <h2 className={`text-xl font-serif italic ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Real-Time PR Build Status Monitor
              </h2>
            </div>
            <p className={`text-xs mt-1 font-sans ${isDark ? 'text-[#a1a1aa]' : 'text-slate-500'}`}>
              Live agent monitoring & sandbox build status feeds across active repositories.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all flex items-center space-x-1.5 border ${
                isLiveStreaming
                  ? isDark
                    ? 'bg-[#141414] text-[#4ade80] border-[#4ade80]/40'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : isDark
                    ? 'bg-[#0c0c0c] text-[#a1a1aa] border-[#1a1a1a]'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {isLiveStreaming ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Stream</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume Stream</span>
                </>
              )}
            </button>

            <span className={`text-[11px] font-mono px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
              isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] text-[#a1a1aa]' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-[#4ade80] shadow-[0_0_6px_#4ade80]' : 'bg-slate-400'}`} />
              WS PORT 3000
            </span>
          </div>
        </div>

        {/* Metric Summary Bar */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t ${
          isDark ? 'border-[#1a1a1a]' : 'border-slate-200'
        }`}>
          <div className="space-y-1">
            <span className={`text-[10px] uppercase tracking-widest font-mono ${isDark ? 'text-[#a1a1aa]' : 'text-slate-400'}`}>
              Monitored PRs
            </span>
            <div className={`text-2xl font-serif italic ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {totalCount} <span className="text-xs font-sans font-normal opacity-50">Active Jobs</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className={`text-[10px] uppercase tracking-widest font-mono ${isDark ? 'text-[#a1a1aa]' : 'text-slate-400'}`}>
              E2B Sandboxes
            </span>
            <div className={`text-2xl font-serif italic ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              {activeCount} <span className="text-xs font-sans font-normal opacity-50">Running</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className={`text-[10px] uppercase tracking-widest font-mono ${isDark ? 'text-[#a1a1aa]' : 'text-slate-400'}`}>
              Auto-Fixed
            </span>
            <div className={`text-2xl font-serif italic ${isDark ? 'text-[#4ade80]' : 'text-emerald-600'}`}>
              {passingCount} <span className="text-xs font-sans font-normal opacity-50">({Math.round((passingCount / totalCount) * 100)}%)</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className={`text-[10px] uppercase tracking-widest font-mono ${isDark ? 'text-[#a1a1aa]' : 'text-slate-400'}`}>
              Avg Resolution
            </span>
            <div className={`text-2xl font-serif italic ${isDark ? 'text-white' : 'text-slate-900'}`}>
              1.4m <span className="text-xs font-sans font-normal opacity-50">per PR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and List Section */}
      <div className={`p-6 rounded-xl border transition-colors shadow-2xl space-y-4 ${
        isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-[#1a1a1a]">
          <div className="flex items-center space-x-2">
            <Filter className={`w-4 h-4 ${isDark ? 'text-[#a1a1aa]' : 'text-slate-500'}`} />
            <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Filter Monitored Pipelines
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {(['all', 'active', 'passing', 'failed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-mono capitalize transition-all border ${
                  filter === f
                    ? isDark
                      ? 'bg-[#141414] text-white border-white/20 shadow-sm'
                      : 'bg-slate-900 text-white border-slate-900'
                    : isDark
                      ? 'bg-[#080808] text-[#a1a1aa] border-[#1a1a1a] hover:text-white'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* PR Status List */}
        <div className="space-y-4">
          {filteredPrs.map((pr) => (
            <div
              key={pr.id}
              className={`p-5 rounded-lg border transition-all space-y-3 ${
                isDark
                  ? 'bg-[#080808] border-[#1a1a1a] hover:border-white/10'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Top Row: Repo/PR + Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3 flex-wrap">
                  <span className={`font-mono text-xs font-bold ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
                    {pr.repoOwner}/{pr.repoName}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                    isDark ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' : 'bg-purple-100 text-purple-800'
                  }`}>
                    PR #{pr.prNumber}
                  </span>
                  <span className={`text-xs font-mono ${isDark ? 'text-[#a1a1aa]' : 'text-slate-500'}`}>
                    branch: <code className="text-blue-400">{pr.branch}</code>
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  {getStatusBadge(pr.status)}
                  <button
                    onClick={() => handleRestartPR(pr.id)}
                    className={`p-1.5 rounded transition-colors ${
                      isDark ? 'hover:bg-[#141414] text-[#a1a1aa] hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                    }`}
                    title="Rerun agent build"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3 className={`font-serif italic text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {pr.title}
              </h3>

              {/* Progress Bar & Active Step */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className={isDark ? 'text-white/80' : 'text-slate-700'}>
                    {pr.activeStep}
                  </span>
                  <span className={isDark ? 'text-[#4ade80]' : 'text-emerald-600 font-bold'}>
                    {pr.progressPercent}%
                  </span>
                </div>

                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#1a1a1a]' : 'bg-slate-200'}`}>
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      pr.status === 'passing'
                        ? 'bg-[#4ade80]'
                        : pr.status === 'failed'
                        ? 'bg-red-500'
                        : 'bg-gradient-to-r from-amber-400 via-emerald-400 to-[#4ade80]'
                    }`}
                    style={{ width: `${pr.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Footer Meta: Attempt, Elapsed, Author */}
              <div className={`pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono gap-2 border-t ${
                isDark ? 'border-[#1a1a1a] text-[#a1a1aa]' : 'border-slate-200 text-slate-500'
              }`}>
                <div className="flex items-center space-x-4">
                  <span>
                    Attempt: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{pr.attempt}/{pr.maxAttempts}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    Time: {formatSeconds(pr.timeElapsedSeconds)}
                  </span>
                  <span>Author: @{pr.author}</span>
                </div>

                {onSelectPR && (
                  <button
                    onClick={() => onSelectPR(pr.prNumber)}
                    className={`text-xs font-bold hover:underline flex items-center gap-1 ${
                      isDark ? 'text-[#4ade80]' : 'text-emerald-600'
                    }`}
                  >
                    <span>Inspect in Simulator</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
