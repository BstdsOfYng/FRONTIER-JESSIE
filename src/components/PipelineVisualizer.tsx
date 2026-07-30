import React, { useEffect, useState } from 'react';
import { Radio, Bot, Terminal, GitPullRequest, ArrowRight, Zap, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeMode } from '../types';
import { playTactileSound } from '../utils/sound';

interface PipelineVisualizerProps {
  status: 'queued' | 'reproducing' | 'analyzing' | 'patching' | 'verifying' | 'resolved' | 'failed';
  theme?: ThemeMode;
  onSimulateWebhook: () => void;
  onRunAgent: () => void;
  soundFxEnabled?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'char';
  char?: string;
  delay: number;
}

const PARTICLE_CHARS = ['✓', '1', '0', '⚡', '✦', 'PATCH', 'PASSED'];
const PARTICLE_COLORS = ['#4ade80', '#22c55e', '#86efac', '#34d399', '#a7f3d0'];

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  status,
  onSimulateWebhook,
  onRunAgent,
  soundFxEnabled = true,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showExplosion, setShowExplosion] = useState(false);

  useEffect(() => {
    if (status === 'resolved') {
      // Generate particle explosion
      const newParticles: Particle[] = Array.from({ length: 32 }).map((_, i) => {
        const angle = (i / 32) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
        const distance = 80 + Math.random() * 180;
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          size: Math.random() * 8 + 4,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
          shape: Math.random() > 0.4 ? 'char' : Math.random() > 0.5 ? 'circle' : 'square',
          char: PARTICLE_CHARS[Math.floor(Math.random() * PARTICLE_CHARS.length)],
          delay: Math.random() * 0.15,
        };
      });

      setParticles(newParticles);
      setShowExplosion(true);
      playTactileSound('success', soundFxEnabled);

      const timer = setTimeout(() => {
        setShowExplosion(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [status, soundFxEnabled]);

  const handleSimulate = () => {
    playTactileSound('webhook', soundFxEnabled);
    onSimulateWebhook();
  };

  const handleRun = () => {
    playTactileSound('primary', soundFxEnabled);
    onRunAgent();
  };

  const getNodeState = (nodeStep: 'webhook' | 'ai' | 'sandbox' | 'deploy') => {
    if (status === 'resolved') return 'completed';
    if (status === 'failed') return nodeStep === 'deploy' ? 'failed' : 'completed';

    switch (nodeStep) {
      case 'webhook':
        return 'completed';
      case 'ai':
        return status === 'analyzing' ? 'active' : ['patching', 'verifying'].includes(status) ? 'completed' : 'idle';
      case 'sandbox':
        return status === 'reproducing' || status === 'verifying' || status === 'patching' ? 'active' : 'idle';
      case 'deploy':
        return 'idle';
      default:
        return 'idle';
    }
  };

  const steps = [
    {
      id: 'webhook',
      title: '1. Ingress Listener',
      subtitle: 'check_run.completed',
      detail: 'HTTP 202 Accepted • 0.12ms',
      icon: <Radio className="w-4 h-4 text-cyan-400" />,
      state: getNodeState('webhook'),
    },
    {
      id: 'ai',
      title: '2. Gemini 3.6 Flash',
      subtitle: 'Root Cause Analyzer',
      detail: 'AST Analysis & Diff Gen',
      icon: <Bot className="w-4 h-4 text-[#4ade80]" />,
      state: getNodeState('ai'),
    },
    {
      id: 'sandbox',
      title: '3. E2B Sandbox',
      subtitle: 'Ephemeral Devcontainer',
      detail: 'Jest / Pytest Runner',
      icon: <Terminal className="w-4 h-4 text-amber-400" />,
      state: getNodeState('sandbox'),
    },
    {
      id: 'deploy',
      title: '4. PR Resolution',
      subtitle: 'Auto-Fix Verified',
      detail: 'Git Commit Pushed',
      icon: <GitPullRequest className="w-4 h-4 text-[#4ade80]" />,
      state: getNodeState('deploy'),
    },
  ];

  return (
    <div className="p-5 rounded-xl border transition-all relative overflow-hidden shadow-2xl bg-[#0b0f19]/80 border-white/10 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 border-b pb-3 border-white/10">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-[#4ade80] animate-pulse" />
          <h3 className="font-serif italic text-base text-white">Active Pipeline Dataflow</h3>
          <span className="px-2 py-0.5 text-[10px] font-mono bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/30 rounded uppercase tracking-wider">
            Real-Time Node Topology
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleSimulate}
            className="px-2.5 py-1 text-xs font-mono bg-[#141414] hover:bg-[#1f293d] text-cyan-400 border border-cyan-500/30 rounded transition-all flex items-center space-x-1 cursor-pointer"
          >
            <Radio className="w-3 h-3" />
            <span>Simulate Ingress</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleRun}
            className="px-2.5 py-1 text-xs font-mono font-bold bg-[#4ade80] hover:bg-[#3ecf73] text-black rounded transition-all shadow-[0_0_12px_rgba(74,222,128,0.4)] flex items-center space-x-1 uppercase cursor-pointer"
          >
            <Zap className="w-3 h-3" />
            <span>Run Pipeline</span>
          </motion.button>
        </div>
      </div>

      {/* Green Particle Explosion Effect Overlay */}
      <AnimatePresence>
        {showExplosion && (
          <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center overflow-hidden">
            {/* Radial Green Shockwave Flash */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0.9 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="w-64 h-64 rounded-full bg-gradient-to-r from-[#4ade80]/40 via-emerald-400/20 to-transparent blur-xl border-2 border-[#4ade80]/60"
            />

            {/* Particle Burst Elements */}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.5, rotate: 0 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  opacity: [1, 1, 0],
                  scale: [0.8, 1.3, 0.2],
                  rotate: [0, (p.id % 2 === 0 ? 180 : -180)],
                }}
                transition={{
                  duration: 1.2 + Math.random() * 0.4,
                  delay: p.delay,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute font-mono font-bold text-xs select-none"
                style={{
                  color: p.color,
                  textShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}`,
                }}
              >
                {p.shape === 'char' ? (
                  <span className="text-[11px] uppercase tracking-wider">{p.char}</span>
                ) : p.shape === 'circle' ? (
                  <span
                    className="block rounded-full shadow-lg"
                    style={{
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      backgroundColor: p.color,
                      boxShadow: `0 0 8px ${p.color}`,
                    }}
                  />
                ) : (
                  <span
                    className="block rotate-45 shadow-lg"
                    style={{
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      backgroundColor: p.color,
                      boxShadow: `0 0 8px ${p.color}`,
                    }}
                  />
                )}
              </motion.div>
            ))}

            {/* Verified Success Badge Banner Burst */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'backOut' }}
              className="bg-[#05180d]/90 border-2 border-[#4ade80] text-[#4ade80] px-4 py-2 rounded-lg shadow-[0_0_25px_rgba(74,222,128,0.5)] flex items-center space-x-2 font-mono text-xs font-bold uppercase tracking-widest backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-[#4ade80] animate-spin" />
              <span>Hotfix Verified & Pushed</span>
              <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Nodes Map Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
        {steps.map((step, idx) => {
          const isActive = step.state === 'active';
          const isCompleted = step.state === 'completed';

          return (
            <motion.div
              key={step.id}
              whileHover={{ scale: 1.02 }}
              className={`p-3.5 rounded-lg border transition-all relative flex flex-col justify-between ${
                isActive
                  ? 'bg-[#111827] border-[#4ade80] neon-glow-green'
                  : isCompleted
                  ? 'bg-[#080d1a] border-emerald-500/40'
                  : 'bg-[#05070f] border-white/10 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-md ${
                  isActive ? 'bg-[#4ade80]/20 border border-[#4ade80]' : 'bg-white/5 border border-white/10'
                }`}>
                  {step.icon}
                </div>
                {isActive ? (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-[#4ade80]">
                    <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-ping" />
                    RUNNING
                  </span>
                ) : isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                ) : (
                  <span className="text-[10px] font-mono text-slate-500">READY</span>
                )}
              </div>

              <div>
                <h4 className="font-mono text-xs font-bold text-white">{step.title}</h4>
                <p className="text-[11px] font-sans text-slate-400 mt-0.5">{step.subtitle}</p>
                <div className="mt-2 text-[10px] font-mono text-[#4ade80] bg-[#4ade80]/5 px-2 py-0.5 rounded border border-[#4ade80]/20 inline-block">
                  {step.detail}
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className={`w-4 h-4 ${isActive || isCompleted ? 'text-[#4ade80]' : 'text-slate-600'}`} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
