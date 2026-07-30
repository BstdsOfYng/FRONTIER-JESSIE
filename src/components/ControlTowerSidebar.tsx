import React from 'react';
import {
  FolderGit2,
  Bot,
  ShieldCheck,
  Zap,
  Sliders,
  Volume2,
  VolumeX,
  Lock,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { AgentSettings, AgentPersona, ThemeMode } from '../types';
import { playTactileSound } from '../utils/sound';

interface ControlTowerSidebarProps {
  settings: AgentSettings;
  onUpdateSettings: (newSettings: AgentSettings) => void;
  selectedRepo: string;
  onSelectRepo: (repoFullName: string) => void;
  theme?: ThemeMode;
}

const CONNECTED_REPOS = [
  { fullName: 'facebook/react', status: 'active', branch: 'fix/auth-middleware', activePRs: 2 },
  { fullName: 'vercel/next.js', status: 'active', branch: 'linter-clean-up', activePRs: 1 },
  { fullName: 'nodejs/node', status: 'idling', branch: 'worker-leak-patch', activePRs: 1 },
  { fullName: 'prisma/prisma', status: 'idling', branch: 'fix-conn-race', activePRs: 0 },
];

export const ControlTowerSidebar: React.FC<ControlTowerSidebarProps> = ({
  settings,
  onUpdateSettings,
  selectedRepo,
  onSelectRepo,
}) => {
  const isDark = true;

  const currentPersona = settings.persona || 'safe_linter';
  const confidence = settings.confidenceThreshold ?? 75;
  const soundFx = settings.soundFxEnabled ?? true;

  const handlePersonaChange = (p: AgentPersona) => {
    playTactileSound('toggle', soundFx);
    onUpdateSettings({ ...settings, persona: p });
  };

  const handleConfidenceChange = (val: number) => {
    onUpdateSettings({ ...settings, confidenceThreshold: val });
  };

  const handleToggleCVEs = () => {
    playTactileSound('toggle', soundFx);
    onUpdateSettings({ ...settings, autoFixCVEs: !settings.autoFixCVEs });
  };

  const handleToggleSound = () => {
    const nextSoundState = !soundFx;
    playTactileSound('toggle', nextSoundState);
    onUpdateSettings({ ...settings, soundFxEnabled: nextSoundState });
  };

  return (
    <aside className="p-4 rounded-xl border transition-all space-y-6 shadow-2xl bg-[#0b0f19]/80 border-white/10 text-white">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b pb-3 border-white/10">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-[#4ade80]" />
          <h2 className="font-serif italic text-base font-bold text-white">Agent Control Tower</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.88 }}
          onClick={handleToggleSound}
          className="p-1.5 rounded transition-colors hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
          title={soundFx ? 'Mute Sound FX' : 'Enable Sound FX'}
        >
          {soundFx ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
        </motion.button>
      </div>

      {/* 1. Connected Repositories */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          <span className="flex items-center gap-1.5">
            <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
            Connected Repos
          </span>
          <span className="text-[10px] text-[#4ade80]">{CONNECTED_REPOS.length} Live</span>
        </div>

        <div className="space-y-1.5">
          {CONNECTED_REPOS.map((repo) => {
            const isSelected = selectedRepo === repo.fullName;
            return (
              <motion.div
                key={repo.fullName}
                whileHover={{ scale: 1.015, x: 2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  onSelectRepo(repo.fullName);
                  playTactileSound('click', soundFx);
                }}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#1f293d] border-[#4ade80] shadow-[0_0_12px_rgba(74,222,128,0.15)]'
                    : 'bg-[#05070f] border-white/5 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    repo.status === 'active' ? 'bg-[#4ade80] shadow-[0_0_6px_#4ade80] animate-pulse' : 'bg-slate-500'
                  }`} />
                  <div className="truncate">
                    <span className="font-mono text-xs font-bold text-white block truncate">{repo.fullName}</span>
                    <span className="text-[10px] font-mono text-slate-400 block truncate">{repo.branch}</span>
                  </div>
                </div>

                {repo.activePRs > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/30 rounded">
                    {repo.activePRs} PR
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 2. Agent Persona Matrix */}
      <div className="space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          <Bot className="w-3.5 h-3.5 text-purple-400" />
          <span>Agent Persona Matrix</span>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {[
            { id: 'safe_linter', name: 'Safe Linter & Types', desc: 'Syntax, formatting & type fixes', icon: <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> },
            { id: 'aggressive_refactor', name: 'Aggressive Refactor', desc: 'Deep logic re-architecture', icon: <Zap className="w-3.5 h-3.5 text-amber-400" /> },
            { id: 'security_patch', name: 'Security Patching', desc: 'Fix CVEs & sanitize inputs', icon: <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80]" /> },
            { id: 'autonomous_ci', name: 'Autonomous CI', desc: 'Auto-merge passing fixes', icon: <Sliders className="w-3.5 h-3.5 text-cyan-400" /> },
          ].map((persona) => {
            const isActive = currentPersona === persona.id;
            return (
              <motion.button
                key={persona.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePersonaChange(persona.id as AgentPersona)}
                className={`p-2 rounded-lg border text-left transition-all flex items-center space-x-2.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#1e1b4b] border-purple-500/60 text-white shadow-sm'
                    : 'bg-[#05070f] border-white/5 hover:bg-white/5 text-slate-400'
                }`}
              >
                <div className="shrink-0">{persona.icon}</div>
                <div className="truncate">
                  <span className="font-mono text-xs font-bold block text-white truncate">{persona.name}</span>
                  <span className="text-[10px] font-sans text-slate-400 block truncate">{persona.desc}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 3. Confidence Threshold Slider */}
      <div className="space-y-2 bg-[#05070f] p-3 rounded-lg border border-white/10">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-white">
          <span>Agent Merge Confidence</span>
          <span className="text-[#4ade80] font-mono">{confidence}%</span>
        </div>
        <input
          type="range"
          min="50"
          max="95"
          value={confidence}
          onChange={(e) => handleConfidenceChange(Number(e.target.value))}
          onPointerUp={() => playTactileSound('toggle', soundFx)}
          className="w-full accent-[#4ade80] cursor-pointer"
        />
        <p className="text-[10px] font-sans text-slate-400">
          Requires {confidence}% AI certainty score before executing live GitHub auto-commits.
        </p>
      </div>

      {/* 4. Security Check Toggles */}
      <div className="space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>Security Guardrails</span>
        </div>

        <div className="space-y-1.5 text-xs">
          <motion.label 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-between p-2 rounded bg-[#05070f] border border-white/5 cursor-pointer hover:border-white/20"
          >
            <span className="font-sans text-slate-300 text-xs">Auto-fix High CVEs</span>
            <input
              type="checkbox"
              checked={settings.autoFixCVEs ?? true}
              onChange={handleToggleCVEs}
              className="accent-[#4ade80] rounded cursor-pointer"
            />
          </motion.label>

          <motion.label 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-between p-2 rounded bg-[#05070f] border border-white/5 cursor-pointer hover:border-white/20"
          >
            <span className="font-sans text-slate-300 text-xs">Deterministic Tests Only</span>
            <input
              type="checkbox"
              checked={settings.onlyDeterministicTests}
              onChange={() => {
                onUpdateSettings({ ...settings, onlyDeterministicTests: !settings.onlyDeterministicTests });
                playTactileSound('toggle', soundFx);
              }}
              className="accent-[#4ade80] rounded cursor-pointer"
            />
          </motion.label>
        </div>
      </div>
    </aside>
  );
};
