import React from 'react';
import { Bot, GitPullRequest, Radio, ShieldCheck, Cpu, Activity, Search, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';
import { playTactileSound, unlockAudio } from '../utils/sound';

interface HeaderProps {
  activeTab: 'simulator' | 'status' | 'webhooks' | 'settings' | 'architecture';
  setActiveTab: (tab: 'simulator' | 'status' | 'webhooks' | 'settings' | 'architecture') => void;
  webhookCount: number;
  onOpenCommandPalette: () => void;
  soundFxEnabled?: boolean;
  onToggleSoundFx?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  webhookCount,
  onOpenCommandPalette,
  soundFxEnabled = true,
  onToggleSoundFx,
}) => {
  const handleTabClick = (tab: 'simulator' | 'status' | 'webhooks' | 'settings' | 'architecture') => {
    unlockAudio();
    playTactileSound('tab', soundFxEnabled);
    setActiveTab(tab);
  };

  const handleCommandOpen = () => {
    unlockAudio();
    playTactileSound('modal', soundFxEnabled);
    onOpenCommandPalette();
  };

  const handleSoundToggle = () => {
    unlockAudio();
    if (onToggleSoundFx) {
      onToggleSoundFx();
      if (!soundFxEnabled) {
        // Just enabled sound, play test sound
        setTimeout(() => playTactileSound('openHub', true), 50);
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#030712]/95 backdrop-blur-md border-b border-white/10 text-slate-200">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between min-h-[64px] py-2.5 gap-3">
          {/* Brand & System Status */}
          <div className="flex items-center gap-3 shrink-0">
            <motion.div 
              whileHover={{ rotate: 12, scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              className="h-9 w-9 rounded-xl bg-[#0b0f19] border border-[#4ade80]/30 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(74,222,128,0.15)] cursor-pointer"
              onClick={() => handleTabClick('simulator')}
            >
              <Bot className="w-5 h-5 text-[#4ade80]" />
            </motion.div>
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
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCommandOpen}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-[#0b0f19] hover:bg-[#1f293d] hover:border-white/20 text-xs font-mono text-slate-300 hover:text-white transition-all shrink-0 cursor-pointer"
              title="Open Command Palette (Cmd + K)"
            >
              <Search className="w-3.5 h-3.5 text-[#4ade80]" />
              <span className="hidden sm:inline">Command Hub</span>
              <span className="px-1.5 py-0.2 text-[10px] bg-white/10 rounded border border-white/10 text-slate-400 font-bold">
                ⌘K
              </span>
            </motion.button>

            {/* Audio Quick-Toggle Button */}
            {onToggleSoundFx && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleSoundToggle}
                className={`p-1.5 rounded-lg border transition-all shrink-0 cursor-pointer flex items-center gap-1.5 px-2 text-xs font-mono ${
                  soundFxEnabled
                    ? 'bg-[#4ade80]/10 border-[#4ade80]/40 text-[#4ade80] shadow-[0_0_10px_rgba(74,222,128,0.2)]'
                    : 'bg-[#0b0f19] border-white/10 text-slate-500 hover:text-slate-300'
                }`}
                title={soundFxEnabled ? 'Tactile Sound FX Enabled (Click to Mute)' : 'Tactile Sound FX Muted (Click to Enable)'}
              >
                {soundFxEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#4ade80]" />
                    <span className="hidden md:inline font-bold">Audio ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden md:inline">Muted</span>
                  </>
                )}
              </motion.button>
            )}

            {/* Nav Tabs */}
            <nav className="flex items-center gap-1 sm:gap-1.5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleTabClick('simulator')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                  activeTab === 'simulator'
                    ? 'bg-[#1f293d] text-white border border-[#4ade80]/50 shadow-[0_0_12px_rgba(74,222,128,0.15)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <GitPullRequest className="w-3.5 h-3.5 text-[#4ade80]" />
                <span>Command Tower</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleTabClick('status')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                  activeTab === 'status'
                    ? 'bg-[#1f293d] text-white border border-[#4ade80]/50 shadow-[0_0_12px_rgba(74,222,128,0.15)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Status Monitor</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleTabClick('webhooks')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap relative cursor-pointer ${
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
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleTabClick('settings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#1f293d] text-white border border-[#4ade80]/50 shadow-[0_0_12px_rgba(74,222,128,0.15)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Guardrails</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleTabClick('architecture')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
                  activeTab === 'architecture'
                    ? 'bg-[#1f293d] text-white border border-[#4ade80]/50 shadow-[0_0_12px_rgba(74,222,128,0.15)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>Architecture</span>
              </motion.button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};
