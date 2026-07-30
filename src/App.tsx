import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PRSimulator } from './components/PRSimulator';
import { RealTimeStatus } from './components/RealTimeStatus';
import { WebhookInspector } from './components/WebhookInspector';
import { SettingsPanel } from './components/SettingsPanel';
import { ArchitectureGuide } from './components/ArchitectureGuide';
import { CommandPalette } from './components/CommandPalette';
import { ControlTowerSidebar } from './components/ControlTowerSidebar';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { AIThinkingPanel } from './components/AIThinkingPanel';
import { TabTransitionWrapper } from './components/TabTransitionWrapper';
import { WebhookEvent, AgentSettings, LogEntry } from './types';
import { playTactileSound } from './utils/sound';
import { Radio, X, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'status' | 'webhooks' | 'settings' | 'architecture'>('simulator');
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('facebook/react');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [webhookFlash, setWebhookFlash] = useState<WebhookEvent | null>(null);

  // Live thinking logs and active run states for Right Sidebar AI Thinking Panel
  const [currentLogs, setCurrentLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      timestamp: new Date().toISOString(),
      type: 'info',
      message: 'Agent System initialized. Listening for GitHub webhooks on /api/webhook...',
    },
    {
      id: 'init-2',
      timestamp: new Date().toISOString(),
      type: 'ai',
      message: 'Gemini 3.6 Flash connected. Model ready for stack trace & AST diff analysis.',
    }
  ]);
  const [currentStatus, setCurrentStatus] = useState<'queued' | 'reproducing' | 'analyzing' | 'patching' | 'verifying' | 'resolved' | 'failed'>('resolved');
  const [tokensUsed, setTokensUsed] = useState<number>(1420);
  const [executionTimeMs, setExecutionTimeMs] = useState<number>(1240);

  // Agent Guardrail settings state
  const [settings, setSettings] = useState<AgentSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agent_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // fallback
        }
      }
    }
    return {
      maxAttempts: 3,
      maxFilesModified: 2,
      tokenBudget: 5000,
      autoCommitAndPush: true,
      onlyDeterministicTests: true,
      githubToken: '',
      persona: 'safe_linter',
      confidenceThreshold: 85,
      autoFixCVEs: true,
      soundFxEnabled: true,
    };
  });

  const handleUpdateSettings = (newSettings: AgentSettings) => {
    setSettings(newSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agent_settings', JSON.stringify(newSettings));
    }
  };

  const fetchWebhooks = async () => {
    try {
      const res = await fetch('/api/webhooks');
      if (res.ok) {
        const data = await res.json();
        const fetched: WebhookEvent[] = data.events || [];
        if (fetched.length > webhooks.length && webhooks.length > 0) {
          const newest = fetched[0];
          setWebhookFlash(newest);
          playTactileSound('webhook', settings.soundFxEnabled);
        }
        setWebhooks(fetched);
      }
    } catch (err) {
      console.error('Failed to fetch webhooks:', err);
    }
  };

  useEffect(() => {
    fetchWebhooks();
    const interval = setInterval(fetchWebhooks, 5000);
    return () => clearInterval(interval);
  }, [webhooks.length, settings.soundFxEnabled]);

  // Global Keyboard Listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClearWebhooks = async () => {
    try {
      await fetch('/api/webhooks', { method: 'DELETE' });
      setWebhooks([]);
    } catch (err) {
      console.error('Failed to clear webhooks:', err);
    }
  };

  const handleSimulateWebhook = async () => {
    try {
      const sampleWebhook = {
        event: 'check_run',
        action: 'completed',
        repository: {
          name: selectedRepo.split('/')[1] || 'react',
          owner: selectedRepo.split('/')[0] || 'facebook',
          fullName: selectedRepo,
          defaultBranch: 'main',
        },
        pullRequest: {
          number: 1402,
          title: 'Fix failing auth-middleware unit tests',
          branch: 'fix/auth-middleware',
          author: 'dan_abramov',
          url: 'https://github.com/facebook/react/pull/1402',
          diffUrl: 'https://github.com/facebook/react/pull/1402.diff',
        },
        checkRun: {
          name: 'Jest Unit Test Suite',
          status: 'completed',
          conclusion: 'failure' as const,
          detailsUrl: 'https://github.com/facebook/react/actions/runs/882194',
        },
        rawPayload: JSON.stringify({ event: 'check_run.completed', conclusion: 'failure' }, null, 2),
      };

      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleWebhook),
      });

      if (res.ok) {
        setWebhookFlash({
          id: `wh_${Date.now()}`,
          timestamp: new Date().toISOString(),
          event: 'check_run',
          action: 'completed',
          repository: sampleWebhook.repository,
          pullRequest: sampleWebhook.pullRequest,
          checkRun: sampleWebhook.checkRun,
          rawPayload: sampleWebhook.rawPayload,
          processed: true,
        });
        playTactileSound('webhook', settings.soundFxEnabled);
        fetchWebhooks();
      }
    } catch (err) {
      console.error('Failed to simulate webhook:', err);
    }
  };

  const handleRunAgent = async () => {
    setCurrentStatus('analyzing');
    playTactileSound('beacon', settings.soundFxEnabled);

    const newLog: LogEntry = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'ai',
      message: `[${(settings.persona || 'safe_linter').toUpperCase()}]: Initiating AST diff analysis for ${selectedRepo}...`,
    };
    setCurrentLogs((prev) => [newLog, ...prev]);

    setTimeout(() => {
      setCurrentStatus('verifying');
      setCurrentLogs((prev) => [
        {
          id: `log_${Date.now() + 1}`,
          timestamp: new Date().toISOString(),
          type: 'sandbox',
          message: 'E2B Sandbox Container: Executing Jest test suite inside isolated runner...',
        },
        ...prev,
      ]);
    }, 1200);

    setTimeout(() => {
      setCurrentStatus('resolved');
      setTokensUsed((prev) => prev + 480);
      setExecutionTimeMs(1180);
      playTactileSound('success', settings.soundFxEnabled);
      setCurrentLogs((prev) => [
        {
          id: `log_${Date.now() + 2}`,
          timestamp: new Date().toISOString(),
          type: 'success',
          message: 'Patch verified! GitHub Check suite green. Hotfix commit pushed automatically.',
        },
        ...prev,
      ]);
    }, 2800);
  };

  return (
    <div className="min-h-screen transition-colors duration-200 antialiased flex flex-col bg-[#030712] text-[#e2e8f0] selection:bg-[#4ade80]/30 selection:text-[#4ade80] cyber-radial-glow bg-cyber-grid">
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={(t) => {
          playTactileSound('tab', settings.soundFxEnabled);
          setActiveTab(t);
        }}
        webhookCount={webhooks.length}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        soundFxEnabled={settings.soundFxEnabled}
        onToggleSoundFx={() => handleUpdateSettings({ ...settings, soundFxEnabled: !(settings.soundFxEnabled ?? true) })}
      />

      {/* Interactive Command Palette Modal (Cmd + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onRunAgent={handleRunAgent}
        onSimulateWebhook={handleSimulateWebhook}
        onSelectTab={setActiveTab}
        currentPersona={settings.persona}
        onChangePersona={(p) => handleUpdateSettings({ ...settings, persona: p })}
        soundFxEnabled={settings.soundFxEnabled ?? true}
        onToggleSoundFx={() => handleUpdateSettings({ ...settings, soundFxEnabled: !(settings.soundFxEnabled ?? true) })}
      />

      {/* Main Container Stage */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Webhook Flash Ingestion Banner Toast */}
        {webhookFlash && (
          <div className="animate-webhook-flash bg-[#0b1329] border border-[#38bdf8] p-4 rounded-xl shadow-[0_0_25px_rgba(56,189,248,0.3)] flex items-center justify-between transition-all">
            <div className="flex items-center space-x-3">
              <Radio className="w-5 h-5 text-cyan-400 animate-pulse shrink-0" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    ⚡ Webhook Delivery Ingested ({webhookFlash.event}.{webhookFlash.action})
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                    HTTP 202 Accepted
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-300 mt-0.5">
                  Repo: <strong>{webhookFlash.repository.fullName}</strong> • PR #{webhookFlash.pullRequest.number}: {webhookFlash.pullRequest.title}
                </p>
              </div>
            </div>

            <button
              onClick={() => setWebhookFlash(null)}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 3-Column Cyber Command Workspace Architecture */}
        <TabTransitionWrapper activeTab={activeTab}>
          {activeTab === 'simulator' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Control Tower Sidebar (3 Cols) */}
              <div className="lg:col-span-3">
                <ControlTowerSidebar
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  selectedRepo={selectedRepo}
                  onSelectRepo={setSelectedRepo}
                />
              </div>

              {/* Center Main Stage: Active Pipeline Visualizer & Diff Viewer (6 Cols) */}
              <div className="lg:col-span-6 space-y-6">
                <PipelineVisualizer
                  status={currentStatus}
                  onSimulateWebhook={handleSimulateWebhook}
                  onRunAgent={handleRunAgent}
                  soundFxEnabled={settings.soundFxEnabled}
                />

                <PRSimulator
                  settings={settings}
                  onWebhookReceived={fetchWebhooks}
                />
              </div>

              {/* Right Column: AI Thinking Panel & Terminal Log (3 Cols) */}
              <div className="lg:col-span-3">
                <AIThinkingPanel
                  logs={currentLogs}
                  status={currentStatus}
                  tokensUsed={tokensUsed}
                  executionTimeMs={executionTimeMs}
                  onApproveAndMerge={() => {
                    setCurrentStatus('resolved');
                    playTactileSound('success', settings.soundFxEnabled);
                  }}
                  onDeclineAndRevert={() => {
                    setCurrentStatus('failed');
                    playTactileSound('alert', settings.soundFxEnabled);
                  }}
                  onRunAgent={handleRunAgent}
                  soundFxEnabled={settings.soundFxEnabled}
                />
              </div>
            </div>
          )}

          {/* Real-Time Status Monitor Tab */}
          {activeTab === 'status' && (
            <RealTimeStatus
              onSelectPR={() => setActiveTab('simulator')}
            />
          )}

          {/* Webhook Payload Inspector Tab */}
          {activeTab === 'webhooks' && (
            <WebhookInspector
              events={webhooks}
              onClear={handleClearWebhooks}
              onRefresh={fetchWebhooks}
              onTriggerTriage={() => setActiveTab('simulator')}
            />
          )}

          {/* Guardrails Settings Tab */}
          {activeTab === 'settings' && (
            <SettingsPanel
              settings={settings}
              onSaveSettings={handleUpdateSettings}
            />
          )}

          {/* Production Architecture Guide Tab */}
          {activeTab === 'architecture' && (
            <ArchitectureGuide />
          )}
        </TabTransitionWrapper>
      </main>

      {/* Cyber-Terminal Footer */}
      <footer className="border-t border-white/10 py-4 text-center text-xs font-mono bg-[#030712] text-slate-400">
        <div className="max-w-[1600px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-[#4ade80]" />
            <span>Cyber-Command Terminal • Gemini 3.6 Flash & E2B Sandboxes</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[#4ade80]">⌘K</kbd> for Command Hub</span>
            <span>Server API: /api/webhook • Port 3000</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
