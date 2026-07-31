import React, { useState, useEffect } from 'react';
import {
  Search,
  Command,
  Play,
  Radio,
  ShieldCheck,
  Cpu,
  Activity,
  Volume2,
  VolumeX,
  Bot,
  Terminal,
  Zap,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeMode, AgentPersona } from '../types';
import { playTactileSound } from '../utils/sound';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onRunAgent: () => void;
  onSimulateWebhook: () => void;
  onSelectTab: (tab: 'simulator' | 'status' | 'webhooks' | 'settings' | 'architecture') => void;
  currentPersona?: AgentPersona;
  onChangePersona: (persona: AgentPersona) => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
  soundFxEnabled: boolean;
  onToggleSoundFx: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onRunAgent,
  onSimulateWebhook,
  onSelectTab,
  currentPersona = 'safe_linter',
  onChangePersona,
  soundFxEnabled,
  onToggleSoundFx,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const isDark = true;

  const commands = [
    {
      id: 'run-fix',
      category: 'Agent Action',
      label: 'Execute E2B Sandbox AI Hotfix',
      sublabel: 'Run Gemini 3.6 Flash refactor & Jest test runner loop',
      icon: <Play className="w-4 h-4 text-[#4ade80]" />,
      shortcut: '⌘R',
      action: () => {
        playTactileSound('primary', soundFxEnabled);
        onRunAgent();
        onClose();
      }
    },
    {
      id: 'simulate-webhook',
      category: 'Agent Action',
      label: 'Simulate GitHub Webhook Delivery',
      sublabel: 'Fire check_run.completed failure payload to /api/webhook',
      icon: <Radio className="w-4 h-4 text-cyan-400" />,
      shortcut: '⌘W',
      action: () => {
        playTactileSound('webhook', soundFxEnabled);
        onSimulateWebhook();
        onClose();
      }
    },
    {
      id: 'persona-safe',
      category: 'Agent Persona',
      label: 'Persona: Safe Linter & Type Fixer',
      sublabel: 'Focuses on non-breaking syntax, linter rules, and precise types',
      icon: <Bot className="w-4 h-4 text-purple-400" />,
      active: currentPersona === 'safe_linter',
      action: () => {
        playTactileSound('toggle', soundFxEnabled);
        onChangePersona('safe_linter');
        onClose();
      }
    },
    {
      id: 'persona-aggressive',
      category: 'Agent Persona',
      label: 'Persona: Aggressive Logic Refactor',
      sublabel: 'Re-architects buggy code functions with optimized algorithms',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      active: currentPersona === 'aggressive_refactor',
      action: () => {
        playTactileSound('toggle', soundFxEnabled);
        onChangePersona('aggressive_refactor');
        onClose();
      }
    },
    {
      id: 'persona-security',
      category: 'Agent Persona',
      label: 'Persona: Security Patching & Hardening',
      sublabel: 'Patch vulnerability CVEs, sanitize inputs & guard state',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      active: currentPersona === 'security_patch',
      action: () => {
        playTactileSound('toggle', soundFxEnabled);
        onChangePersona('security_patch');
        onClose();
      }
    },
    {
      id: 'nav-simulator',
      category: 'Navigation',
      label: 'Go to Agent Harness & Main Stage',
      sublabel: 'View diff, logs, and E2B sandbox pipeline',
      icon: <Terminal className="w-4 h-4 text-[#4ade80]" />,
      action: () => {
        playTactileSound('tab', soundFxEnabled);
        onSelectTab('simulator');
        onClose();
      }
    },
    {
      id: 'nav-status',
      category: 'Navigation',
      label: 'Go to Real-Time PR Build Monitor',
      sublabel: 'Inspect live build feeds & PR resolution metrics',
      icon: <Activity className="w-4 h-4 text-[#4ade80]" />,
      action: () => {
        playTactileSound('tab', soundFxEnabled);
        onSelectTab('status');
        onClose();
      }
    },
    {
      id: 'nav-webhooks',
      category: 'Navigation',
      label: 'Go to Webhook Payload Inspector',
      sublabel: 'View raw GitHub event deliveries & endpoint details',
      icon: <Radio className="w-4 h-4 text-cyan-400" />,
      action: () => {
        playTactileSound('tab', soundFxEnabled);
        onSelectTab('webhooks');
        onClose();
      }
    },
    {
      id: 'nav-settings',
      category: 'Navigation',
      label: 'Go to Guardrails & Budget Settings',
      sublabel: 'Configure retry budgets, file modification limits, PAT token',
      icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
      action: () => {
        playTactileSound('tab', soundFxEnabled);
        onSelectTab('settings');
        onClose();
      }
    },
    {
      id: 'nav-architecture',
      category: 'Navigation',
      label: 'Go to Production Architecture Guide',
      sublabel: 'View Cloud Run/Lambda serverless architecture specs',
      icon: <Cpu className="w-4 h-4 text-purple-400" />,
      action: () => {
        playTactileSound('tab', soundFxEnabled);
        onSelectTab('architecture');
        onClose();
      }
    },
    {
      id: 'toggle-sound',
      category: 'Preferences',
      label: soundFxEnabled ? 'Mute Tactile Sound FX' : 'Enable Tactile Sound FX',
      sublabel: 'Audio feedback for clicks, webhooks, and agent execution',
      icon: soundFxEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />,
      action: () => {
        playTactileSound('toggle', !soundFxEnabled);
        onToggleSoundFx();
        onClose();
      }
    },
  ];

  const filteredCommands = commands.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.sublabel.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      playTactileSound('openHub', soundFxEnabled);
    }
  }, [isOpen, soundFxEnabled]);

  const handleClose = () => {
    playTactileSound('closeHub', soundFxEnabled);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length < query.length && val === '') {
      playTactileSound('clear', soundFxEnabled);
    } else {
      playTactileSound('keystroke', soundFxEnabled);
    }
    setQuery(val);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
        playTactileSound('click', soundFxEnabled);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
        playTactileSound('click', soundFxEnabled);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        playTactileSound('modal', soundFxEnabled);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, soundFxEnabled, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-2xl rounded-xl border border-white/15 shadow-2xl overflow-hidden bg-[#0b0f19]/95 text-white"
        >
          {/* Search Header Input */}
          <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-[#070a12]">
            <Search className="w-5 h-5 mr-3 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Type a command or search actions (e.g. 'Fix', 'Persona', 'Webhook')..."
              className="w-full bg-transparent text-sm focus:outline-none font-mono text-white placeholder-slate-500"
              autoFocus
            />
            <div className="flex items-center space-x-2 shrink-0">
              <span className="px-2 py-0.5 text-[10px] font-mono rounded border bg-white/5 border-white/10 text-slate-400">
                ESC
              </span>
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.88 }}
                onClick={handleClose}
                className="p-1 rounded hover:bg-white/10 text-slate-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Command Items List */}
          <div className="max-h-96 overflow-y-auto p-2 space-y-1">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-slate-500">
                No matching commands found for "{query}"
              </div>
            ) : (
              filteredCommands.map((cmd, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <motion.div
                    key={cmd.id}
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      playTactileSound('execCommand', soundFxEnabled);
                      cmd.action();
                    }}
                    onMouseEnter={() => {
                      if (selectedIndex !== idx) {
                        setSelectedIndex(idx);
                        playTactileSound('hover', soundFxEnabled);
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#1f293d] border border-[#4ade80]/40 text-white shadow-md'
                        : 'hover:bg-white/5 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-md bg-[#030712] border border-white/10">
                        {cmd.icon}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs">{cmd.label}</span>
                          {cmd.active && (
                            <span className="px-1.5 py-0.2 text-[9px] font-mono bg-[#4ade80]/20 text-[#4ade80] rounded border border-[#4ade80]/30 uppercase">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-sans text-slate-400 mt-0.5">
                          {cmd.sublabel}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-slate-400">
                        {cmd.category}
                      </span>
                      {cmd.shortcut && (
                        <span className="text-[11px] font-mono font-bold text-[#4ade80] bg-[#4ade80]/10 px-2 py-0.5 rounded border border-[#4ade80]/20">
                          {cmd.shortcut}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Command Palette Footer */}
          <div className="px-4 py-2.5 border-t border-white/10 bg-[#070a12] text-slate-500 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center space-x-3">
              <span>
                Use <kbd className="px-1 py-0.5 bg-white/10 rounded">↑</kbd> <kbd className="px-1 py-0.5 bg-white/10 rounded">↓</kbd> to navigate
              </span>
              <span>
                <kbd className="px-1 py-0.5 bg-white/10 rounded">↵</kbd> to select
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Command className="w-3 h-3" />
              <span>Cyber Command Hub</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
