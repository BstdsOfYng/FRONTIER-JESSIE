import React from 'react';
import { Bot, GitPullRequest, Radio, ShieldCheck, Cpu, Activity, Search } from 'lucide-react';

interface HeaderProps {
  activeTab: 'simulator' | 'status' | 'webhooks' | 'settings' | 'architecture';
  setActiveTab: (tab: 'simulator' | 'status' | 'webhooks' | 'settings' | 'architecture') => void;
  webhookCount: number;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  webhookCount,
  onOpenCommandPalette,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#030712]/95 backdrop-blur-md border-b border-white/10 text-slate-200">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between min-h-[64px] py-2.5 gap-3">
          {/* Brand & System Status */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-[#0b0f19] border border-[#4ade80]/30 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(74,222,128,0.15)]">
              <Bot className="w-5 h-5 text-[#4ade80]" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 flex-nowrap">
                <h1 className="font-bold text-xs sm:text-sm tracking-[0.18em] uppercase text-white whitespace-nowrap">
                  Cyber-Command Agent
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full border border-[#4ade80]/40 text-[#4ade80] bg-[#4ade80]/10 shrink-0 flex items-center gap-1.5 uppercase tracking-wider whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-mono text-slate-400 whitespace-nowrap hidden sm:block">
                Infra: Serverless/GCP • Sandbox: E2B • Model: Gemini 3.6 Flash
              </p>
            </div>
          </div>

          {/* Controls & Nav Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
            {/* Search / Cmd+K Pill */}
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-[#0b0f19] hover:bg-[#1f293d] hover:border-white/20 text-xs font-mono text-slate-300 hover:text-white transition-all shrink-0"
              title="Open Command Palette (Cmd + K)"
            >
              <Search className="w-3.5 h-3.5 text-[#4ade80]" />
              <span className="hidden sm:inline">Command Hub</span>
              <span className="px-1.5 py-0.2 text-[10px] bg-white/10 rounded border border-white/10 text-slate-400 font-bold">
                ⌘K
              </span>
            </button>

            {/* Nav Tabs */}
            <nav className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={() => setActiveTab('simulator')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeTab === 'simulator'
                    ? 'bg-[#1f293d] text-white border border-[#4ade80]/50 shadow-[0_0_12px_rgba(74,222,128,0.15)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <GitPullRequest className="w-3.5 h-3.5 text-[#4ade80]" />
                <span>Command Tower</span>
              </button>

              <button
                onClick={() => setActiveTab('status')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeTab === 'status'
                    ? 'bg-[#1f293d] text-white border border-[#4ade80]/50 shadow-[0_0_12px_rgba(74,222,128,0.15)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Status Monitor</span>
              </button>

              <button
                onClick={() => setActiveTab('webhooks')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap relative ${
                  activeTab === 'webhooks'
                    ? 'bg-[#1f293d] text-white border border-[#4ade80]/50 shadow-[0_0_12px_rgba(74,222,128,0.15)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>Webhooks</span>
                {webhookCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {webhookCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-[#1f293d] text-white border border-[#4ade80]/50 shadow-[0_0_12px_rgba(74,222,128,0.15)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Guardrails</span>
              </button>

              <button
                onClick={() => setActiveTab('architecture')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeTab === 'architecture'
                    ? 'bg-[#1f293d] text-white border border-[#4ade80]/50 shadow-[0_0_12px_rgba(74,222,128,0.15)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>Architecture</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};
