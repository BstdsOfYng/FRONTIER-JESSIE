import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  Pause,
  Play,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { MonitoredPRStatus, ThemeMode } from '../types';
import { playTactileSound } from '../utils/sound';

interface RealTimeStatusProps {
  theme?: ThemeMode;
  onSelectPR?: (prNumber: number) => void;
  soundFxEnabled?: boolean;
}

const INITIAL_MONITORED_PRS: MonitoredPRStatus[] = [
  {
    id: 'pr-1402',
    repoOwner: 'facebook',
    repoName: 'react',
    prNumber: 1402,
    title: 'Fix failing auth-middleware unit tests in React Server Components',
    branch: 'fix/auth-middleware',
    author: 'dan_abramov',
    status: 'passing',
    attempt: 1,
    maxAttempts: 3,
    progressPercent: 100,
    activeStep: 'All test suites passing. Patch verified in E2B container.',
    timeElapsedSeconds: 42,
    etaSeconds: 0,
    lastUpdated: '1 min ago',
  },
  {
    id: 'pr-8821',
    repoOwner: 'vercel',
    repoName: 'next.js',
    prNumber: 8821,
    title: 'Sanitize URL search parameters in SSR middleware renderer',
    branch: 'linter-clean-up',
    author: 'timneutkens',
    status: 'analyzing',
    attempt: 2,
    maxAttempts: 3,
    progressPercent: 55,
    activeStep: 'Gemini 3.6 Flash: Generating AST diff for router-utils.ts...',
    timeElapsedSeconds: 18,
    etaSeconds: 15,
    lastUpdated: 'Just now',
  },
  {
    id: 'pr-3921',
    repoOwner: 'nodejs',
    repoName: 'node',
    prNumber: 3921,
    title: 'Fix worker thread memory leak on graceful shutdown event loop',
    branch: 'worker-leak-patch',
    author: 'addaleax',
    status: 'reproducing',
    attempt: 1,
    maxAttempts: 3,
    progressPercent: 25,
    activeStep: 'E2B Sandbox Container: Executing C++ valgrind memory profiler...',
    timeElapsedSeconds: 12,
    etaSeconds: 30,
    lastUpdated: 'Just now',
  },
  {
    id: 'pr-9021',
    repoOwner: 'prisma',
    repoName: 'prisma',
    prNumber: 9021,
    title: 'Fix connection pool race condition in transaction engine',
    branch: 'fix-conn-race',
    author: 'janpio',
    status: 'failed',
    attempt: 3,
    maxAttempts: 3,
    progressPercent: 100,
    activeStep: 'Max attempt budget reached (3/3). Human code review requested.',
    timeElapsedSeconds: 120,
    etaSeconds: 0,
    lastUpdated: '12 mins ago',
  }
];

export const RealTimeStatus: React.FC<RealTimeStatusProps> = ({ onSelectPR, soundFxEnabled = true }) => {
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
            playTactileSound('success', soundFxEnabled);
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
  }, [isLiveStreaming, soundFxEnabled]);

  const handleRestartPR = (prId: string) => {
    playTactileSound('beacon', soundFxEnabled);
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

  const handleToggleStream = () => {
    playTactileSound('toggle', soundFxEnabled);
    setIsLiveStreaming(!isLiveStreaming);
  };

  const handleFilterChange = (f: 'all' | 'active' | 'passing' | 'failed') => {
    playTactileSound('tab', soundFxEnabled);
    setFilter(f);
  };

  const filteredPrs = prs.filter((p) => {
    if (filter === 'active') return ['reproducing', 'analyzing', 'patching', 'verifying', 'iterating', 'queued'].includes(p.status);
    if (filter === 'passing') return p.status === 'passing';
    if (filter === 'failed') return p.status === 'failed';
    return true;
  });

  const totalCount = prs.length;
  const activeCount = prs.filter((p) => ['reproducing', 'analyzing', 'patching', 'verifying', 'iterating', 'queued'].includes(p.status)).length;
  const passingCount = prs.filter((p) => p.status === 'passing').length;

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}m ${remainder < 10 ? '0' : ''}${remainder}s`;
  };

  const getStatusBadge = (status: MonitoredPRStatus['status']) => {
    switch (status) {
      case 'passing':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/30">
            <CheckCircle2 className="w-3 h-3 text-[#4ade80]" />
            Passing & Pushed
          </span>
        );
      case 'failed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/30">
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
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            Active ({status})
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-xl border transition-colors shadow-2xl bg-[#050505] border-[#1a1a1a]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-[#4ade80] animate-pulse" />
              <h2 className="text-xl font-serif italic text-white">
                Real-Time PR Build Status Monitor
              </h2>
            </div>
            <p className="text-xs mt-1 font-sans text-[#a1a1aa]">
              Live agent monitoring & sandbox build status feeds across active repositories.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.93 }}
              onClick={handleToggleStream}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all flex items-center space-x-1.5 border cursor-pointer ${
                isLiveStreaming
                  ? 'bg-[#141414] text-[#4ade80] border-[#4ade80]/40'
                  : 'bg-[#0c0c0c] text-[#a1a1aa] border-[#1a1a1a]'
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
            </motion.button>

            <span className="text-[11px] font-mono px-2.5 py-1 rounded-md border flex items-center gap-1.5 bg-[#0a0a0a] border-[#1a1a1a] text-[#a1a1aa]">
              <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-[#4ade80] shadow-[0_0_6px_#4ade80]' : 'bg-slate-400'}`} />
              WS PORT 3000
            </span>
          </div>
        </div>

        {/* Metric Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#1a1a1a]">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-mono text-[#a1a1aa]">
              Monitored PRs
            </span>
            <div className="text-2xl font-serif italic text-white">
              {totalCount} <span className="text-xs font-sans font-normal opacity-50">Active Jobs</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-mono text-[#a1a1aa]">
              E2B Sandboxes
            </span>
            <div className="text-2xl font-serif italic text-amber-400">
              {activeCount} <span className="text-xs font-sans font-normal opacity-50">Running</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-mono text-[#a1a1aa]">
              Auto-Fixed
            </span>
            <div className="text-2xl font-serif italic text-[#4ade80]">
              {passingCount} <span className="text-xs font-sans font-normal opacity-50">({Math.round((passingCount / totalCount) * 100)}%)</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-mono text-[#a1a1aa]">
              Avg Resolution
            </span>
            <div className="text-2xl font-serif italic text-white">
              1.4m <span className="text-xs font-sans font-normal opacity-50">per PR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and List Section */}
      <div className="p-6 rounded-xl border transition-colors shadow-2xl space-y-4 bg-[#050505] border-[#1a1a1a]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-[#1a1a1a]">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#a1a1aa]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Filter Monitored Pipelines
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {(['all', 'active', 'passing', 'failed'] as const).map((f) => (
              <motion.button
                key={f}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleFilterChange(f)}
                className={`px-3 py-1 rounded-md text-xs font-mono capitalize transition-all border cursor-pointer ${
                  filter === f
                    ? 'bg-[#141414] text-white border-white/20 shadow-sm'
                    : 'bg-[#080808] text-[#a1a1aa] border-[#1a1a1a] hover:text-white'
                }`}
              >
                {f}
              </motion.button>
            ))}
          </div>
        </div>

        {/* PR Status List */}
        <div className="space-y-4">
          {filteredPrs.map((pr) => (
            <motion.div
              key={pr.id}
              whileHover={{ scale: 1.005 }}
              className="p-5 rounded-lg border transition-all space-y-3 bg-[#080808] border-[#1a1a1a] hover:border-white/10"
            >
              {/* Top Row: Repo/PR + Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3 flex-wrap">
                  <span className="font-mono text-xs font-bold text-white/70">
                    {pr.repoOwner}/{pr.repoName}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    PR #{pr.prNumber}
                  </span>
                  <span className="text-xs font-mono text-[#a1a1aa]">
                    branch: <code className="text-blue-400">{pr.branch}</code>
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  {getStatusBadge(pr.status)}
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => handleRestartPR(pr.id)}
                    className="p-1.5 rounded transition-colors hover:bg-[#141414] text-[#a1a1aa] hover:text-white cursor-pointer"
                    title="Rerun agent build"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-serif italic text-base text-white">
                {pr.title}
              </h3>

              {/* Progress Bar & Active Step */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-white/80">
                    {pr.activeStep}
                  </span>
                  <span className="text-[#4ade80]">
                    {pr.progressPercent}%
                  </span>
                </div>

                <div className="w-full h-2 rounded-full overflow-hidden bg-[#1a1a1a]">
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
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono gap-2 border-t border-[#1a1a1a] text-[#a1a1aa]">
                <div className="flex items-center space-x-4">
                  <span>
                    Attempt: <strong className="text-white">{pr.attempt}/{pr.maxAttempts}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    Time: {formatSeconds(pr.timeElapsedSeconds)}
                  </span>
                  <span>Author: @{pr.author}</span>
                </div>

                {onSelectPR && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      playTactileSound('tab', soundFxEnabled);
                      onSelectPR(pr.prNumber);
                    }}
                    className="text-xs font-bold hover:underline flex items-center gap-1 text-[#4ade80] cursor-pointer"
                  >
                    <span>Inspect in Simulator</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
