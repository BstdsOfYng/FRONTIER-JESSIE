import React, { useState } from 'react';
import {
  Brain,
  Terminal,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  RotateCw
} from 'lucide-react';
import { motion } from 'motion/react';
import { LogEntry, ThemeMode } from '../types';
import { playTactileSound } from '../utils/sound';

interface AIThinkingPanelProps {
  logs: LogEntry[];
  status: 'queued' | 'reproducing' | 'analyzing' | 'patching' | 'verifying' | 'resolved' | 'failed';
  tokensUsed: number;
  executionTimeMs: number;
  onApproveAndMerge: () => void;
  onDeclineAndRevert: () => void;
  onRunAgent: () => void;
  theme?: ThemeMode;
  soundFxEnabled?: boolean;
}

export const AIThinkingPanel: React.FC<AIThinkingPanelProps> = ({
  logs,
  status,
  tokensUsed,
  executionTimeMs,
  onApproveAndMerge,
  onDeclineAndRevert,
  onRunAgent,
  soundFxEnabled = true,
}) => {
  const [copiedLogs, setCopiedLogs] = useState(false);

  const isComplete = status === 'resolved';
  const isFailed = status === 'failed';
  const isRunning = ['reproducing', 'analyzing', 'patching', 'verifying'].includes(status);

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}]: ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    playTactileSound('click', soundFxEnabled);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  return (
    <aside className="p-4 rounded-xl border transition-all space-y-5 shadow-2xl flex flex-col h-full justify-between bg-[#0b0f19]/80 border-white/10 text-white">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-white/10">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
            <h2 className="font-serif italic text-base font-bold text-white">AI Thinking Panel</h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCopyLogs}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
            title="Copy Logs"
          >
            {copiedLogs ? <Check className="w-3.5 h-3.5 text-[#4ade80]" /> : <Copy className="w-3.5 h-3.5" />}
          </motion.button>
        </div>

        {/* Action Command Center Buttons */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Action Command Center
          </div>

          <div className="grid grid-cols-1 gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                onApproveAndMerge();
                playTactileSound('success', soundFxEnabled);
              }}
              disabled={isRunning || isFailed}
              className={`w-full py-2.5 px-3 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center space-x-2 border uppercase tracking-wider cursor-pointer ${
                isComplete
                  ? 'bg-[#4ade80] text-black border-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.4)] hover:bg-[#3ecf73]'
                  : 'bg-[#4ade80]/20 text-[#4ade80] border-[#4ade80]/40 hover:bg-[#4ade80]/30 disabled:opacity-40'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Merge Fix</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                onDeclineAndRevert();
                playTactileSound('alert', soundFxEnabled);
              }}
              disabled={isRunning}
              className="w-full py-2 px-3 rounded-lg font-mono text-xs font-bold bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 transition-all flex items-center justify-center space-x-2 uppercase tracking-wider disabled:opacity-40 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Decline & Revert Patch</span>
            </motion.button>
          </div>
        </div>

        {/* Live Stream Execution Metrics */}
        <div className="grid grid-cols-2 gap-2 bg-[#05070f] p-3 rounded-lg border border-white/10 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Tokens Used</span>
            <span className="text-purple-400 font-bold">{tokensUsed.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Sandbox Speed</span>
            <span className="text-[#4ade80] font-bold">{(executionTimeMs / 1000).toFixed(2)}s</span>
          </div>
        </div>

        {/* Stream Thinking Process Terminal Log */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#4ade80]" />
              Agent Mental Model
            </span>
            {isRunning && (
              <span className="flex items-center gap-1 text-[10px] text-[#4ade80]">
                <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-ping" />
                Thinking...
              </span>
            )}
          </div>

          <div className="bg-[#03050b] p-3 rounded-lg border border-white/10 font-mono text-[11px] max-h-[300px] overflow-y-auto space-y-2 leading-relaxed">
            {logs.length === 0 ? (
              <div className="text-slate-500 text-center py-6">
                Click "Run Pipeline" to initialize Gemini 3.6 Flash thinking log stream...
              </div>
            ) : (
              logs.map((log) => {
                let badgeColor = 'text-slate-400';
                if (log.type === 'ai') badgeColor = 'text-purple-400';
                if (log.type === 'cmd') badgeColor = 'text-cyan-400';
                if (log.type === 'error') badgeColor = 'text-red-400';
                if (log.type === 'success') badgeColor = 'text-[#4ade80]';

                return (
                  <div key={log.id} className="space-y-0.5">
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                      <span>[{log.timestamp.slice(11, 19)}]</span>
                      <span className={`font-bold uppercase ${badgeColor}`}>[{log.type}]</span>
                    </div>
                    <p className="text-slate-200 break-words">{log.message}</p>
                    {log.details && (
                      <pre className="text-[10px] text-slate-400 bg-white/5 p-1.5 rounded overflow-x-auto">
                        {log.details}
                      </pre>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Rerun Trigger Footer */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => {
          onRunAgent();
          playTactileSound('beacon', soundFxEnabled);
        }}
        className="w-full py-2 bg-[#141414] hover:bg-[#1f293d] text-white border border-white/10 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer"
      >
        <RotateCw className="w-3.5 h-3.5 text-[#4ade80]" />
        <span>Rerun AI Analysis Loop</span>
      </motion.button>
    </aside>
  );
};
