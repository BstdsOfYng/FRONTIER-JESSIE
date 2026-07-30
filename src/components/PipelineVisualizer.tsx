import React from 'react';
import { Radio, Bot, Terminal, GitPullRequest, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { ThemeMode } from '../types';

interface PipelineVisualizerProps {
  status: 'queued' | 'reproducing' | 'analyzing' | 'patching' | 'verifying' | 'resolved' | 'failed';
  theme?: ThemeMode;
  onSimulateWebhook: () => void;
  onRunAgent: () => void;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  status,
  onSimulateWebhook,
  onRunAgent,
}) => {
  const isDark = true;

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
    <div className={`p-5 rounded-xl border transition-all relative overflow-hidden shadow-2xl ${
      isDark ? 'bg-[#0b0f19]/80 border-white/10' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 border-b pb-3 border-white/10">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-[#4ade80] animate-pulse" />
          <h3 className="font-serif italic text-base text-white">Active Pipeline Dataflow</h3>
          <span className="px-2 py-0.5 text-[10px] font-mono bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/30 rounded uppercase tracking-wider">
            Real-Time Node Topology
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onSimulateWebhook}
            className="px-2.5 py-1 text-xs font-mono bg-[#141414] hover:bg-[#1a1a1a] text-cyan-400 border border-cyan-500/30 rounded transition-all flex items-center space-x-1"
          >
            <Radio className="w-3 h-3" />
            <span>Simulate Ingress</span>
          </button>
          <button
            onClick={onRunAgent}
            className="px-2.5 py-1 text-xs font-mono font-bold bg-[#4ade80] hover:bg-[#3ecf73] text-black rounded transition-all shadow-[0_0_10px_rgba(74,222,128,0.3)] flex items-center space-x-1 uppercase"
          >
            <Zap className="w-3 h-3" />
            <span>Run Pipeline</span>
          </button>
        </div>
      </div>

      {/* Nodes Map Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
        {steps.map((step, idx) => {
          const isActive = step.state === 'active';
          const isCompleted = step.state === 'completed';

          return (
            <div
              key={step.id}
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
            </div>
          );
        })}
      </div>
    </div>
  );
};
