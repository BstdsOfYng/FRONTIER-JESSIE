import React from 'react';
import { PresetScenario, SandboxRun, AgentSettings, WebhookEvent } from '../types';
import { PRESET_SCENARIOS } from '../data/presetScenarios';
import { DiffViewer } from './DiffViewer';
import { TerminalLogs } from './TerminalLogs';
import { GithubPRMockup } from './GithubPRMockup';
import {
  Play,
  GitPullRequest,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Terminal,
  RotateCcw,
  Zap,
  ArrowRight,
  Code2,
  Bug,
  ShieldAlert
} from 'lucide-react';

interface PRSimulatorProps {
  settings: AgentSettings;
  onWebhookReceived: (event: WebhookEvent) => void;
}

export const PRSimulator: React.FC<PRSimulatorProps> = ({ settings, onWebhookReceived }) => {
  const [selectedScenario, setSelectedScenario] = React.useState<PresetScenario>(PRESET_SCENARIOS[0]);
  const [activeRun, setActiveRun] = React.useState<SandboxRun | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'overview' | 'diff' | 'terminal' | 'github'>('overview');
  const [isLivePushing, setIsLivePushing] = React.useState(false);

  // Custom editor tab state
  const [customMode, setCustomMode] = React.useState(false);
  const [customCode, setCustomCode] = React.useState(PRESET_SCENARIOS[0].buggyCode);
  const [customTest, setCustomTest] = React.useState(PRESET_SCENARIOS[0].failingTestCode);
  const [customError, setCustomError] = React.useState(PRESET_SCENARIOS[0].errorMessage);

  const handleScenarioChange = (s: PresetScenario) => {
    setSelectedScenario(s);
    setCustomCode(s.buggyCode);
    setCustomTest(s.failingTestCode);
    setCustomError(s.errorMessage);
    setActiveRun(null);
  };

  const handleRunAgent = async () => {
    setIsRunning(true);
    setActiveRun(null);

    // Initial queued run representation for immediate feedback
    const initialRun: SandboxRun = {
      id: `run_${Date.now()}`,
      webhookId: `wh_${Date.now()}`,
      scenarioId: selectedScenario.id,
      repoOwner: selectedScenario.repoOwner,
      repoName: selectedScenario.repoName,
      prNumber: selectedScenario.prNumber,
      branch: selectedScenario.branch,
      status: 'reproducing',
      logs: [
        {
          id: 'l1',
          timestamp: new Date().toISOString(),
          type: 'info',
          message: `Captured GitHub webhook event for ${selectedScenario.repoOwner}/${selectedScenario.repoName}#${selectedScenario.prNumber}`,
        },
        {
          id: 'l2',
          timestamp: new Date().toISOString(),
          type: 'sandbox',
          message: 'Provisioning E2B sandbox container (Ubuntu 22.04 LTS, Node.js v20.11)...',
        },
      ],
      filename: selectedScenario.filename,
      originalCode: customMode ? customCode : selectedScenario.buggyCode,
      attempts: 1,
      maxAttempts: settings.maxAttempts,
      tokensUsed: 0,
      executionTimeMs: 0,
    };

    setActiveRun(initialRun);

    try {
      const res = await fetch('/api/agent/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenario.id,
          settings,
          customCode: customMode ? customCode : undefined,
          customTest: customMode ? customTest : undefined,
          customError: customMode ? customError : undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.run) {
        setActiveRun(data.run);
        setViewMode('overview');
      }
    } catch (err) {
      console.error('Agent execution error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleLivePushToGithub = async () => {
    if (!activeRun || !settings.githubToken) return;

    setIsLivePushing(true);
    try {
      const res = await fetch('/api/agent/github-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoOwner: activeRun.repoOwner,
          repoName: activeRun.repoName,
          prNumber: activeRun.prNumber,
          branch: activeRun.branch,
          filename: activeRun.filename,
          patchedCode: activeRun.patchedCode,
          githubToken: settings.githubToken,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActiveRun({
          ...activeRun,
          pushedToGithub: true,
          prCommentUrl: data.commentUrl || activeRun.prCommentUrl,
        });
        alert(`Success! Pushed commit ${data.commitSha.slice(0, 7)} to GitHub PR #${activeRun.prNumber}`);
      } else {
        alert(`GitHub Push Error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Push failed: ${err.message}`);
    } finally {
      setIsLivePushing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scenario Selector Header */}
      <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#a1a1aa] font-mono block mb-1">Active Scenario Configuration</span>
            <h2 className="text-xl font-serif italic text-white flex items-center gap-2">
              <Bug className="w-5 h-5 text-amber-400 not-italic" />
              <span>Select Failing PR Scenario or Custom Code</span>
            </h2>
            <p className="text-xs text-[#a1a1aa] mt-1 font-sans">
              Autonomous self-healing harness reproduces CI build failures in isolated E2B sandboxes.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCustomMode(!customMode)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-all border ${
                customMode
                  ? 'bg-[#141414] text-purple-300 border-purple-500/40'
                  : 'bg-[#0c0c0c] text-[#a1a1aa] border-[#1a1a1a] hover:text-white hover:border-white/20'
              }`}
            >
              {customMode ? '← Back to Presets' : '✏️ Custom PR Builder'}
            </button>

            <button
              onClick={handleRunAgent}
              disabled={isRunning}
              className="px-4 py-2 bg-[#4ade80] hover:bg-[#3ecf73] text-black font-bold text-xs rounded-md shadow-[0_0_12px_rgba(74,222,128,0.25)] transition-all flex items-center space-x-2 disabled:opacity-50 font-mono uppercase tracking-wider"
            >
              {isRunning ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Sandbox Active...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-black text-black" />
                  <span>Run Self-Healing Agent</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preset Cards Grid */}
        {!customMode && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {PRESET_SCENARIOS.map((s) => {
              const isSelected = selectedScenario.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => handleScenarioChange(s)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-[#0c0c0c] border-[#4ade80] shadow-[0_0_10px_rgba(74,222,128,0.1)]'
                      : 'bg-[#080808] border-[#1a1a1a] hover:bg-[#0c0c0c] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {s.category}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />}
                  </div>

                  <div className="font-bold text-xs text-white line-clamp-1 font-sans">
                    {s.title}
                  </div>

                  <p className="text-[11px] text-[#a1a1aa] line-clamp-2 leading-relaxed">
                    {s.description}
                  </p>

                  <div className="pt-2 border-t border-[#1a1a1a] flex items-center justify-between text-[10px] text-white/40 font-mono">
                    <span>{s.repoOwner}/{s.repoName}</span>
                    <span className="text-white/60">PR #{s.prNumber}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Custom Code Input Mode */}
        {customMode && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <label className="text-white/80 font-bold mb-1 block">Failing Source Code ({selectedScenario.filename}):</label>
                <textarea
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="w-full h-44 bg-[#080808] border border-[#1a1a1a] rounded-lg p-3 text-[#dcdcdc] focus:outline-none focus:border-[#4ade80]"
                />
              </div>

              <div>
                <label className="text-white/80 font-bold mb-1 block">Failing Unit Test Code:</label>
                <textarea
                  value={customTest}
                  onChange={(e) => setCustomTest(e.target.value)}
                  className="w-full h-44 bg-[#080808] border border-[#1a1a1a] rounded-lg p-3 text-[#dcdcdc] focus:outline-none focus:border-[#4ade80]"
                />
              </div>
            </div>

            <div>
              <label className="text-white/80 font-bold text-xs mb-1 block font-mono">Compiler / Test Error Stack Trace:</label>
              <input
                type="text"
                value={customError}
                onChange={(e) => setCustomError(e.target.value)}
                className="w-full bg-[#080808] border border-[#1a1a1a] rounded-lg p-2.5 text-xs text-red-400 font-mono focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* PR Header & Details Banner */}
      <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-lg bg-[#0c0c0c] border border-white/10 text-purple-400 shrink-0">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="font-mono text-xs font-bold text-white/60">
                {selectedScenario.repoOwner}/{selectedScenario.repoName}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase">
                PR #{selectedScenario.prNumber}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">
                CI Status: Failing
              </span>
            </div>

            <h3 className="font-serif italic text-white text-lg mt-1">
              {selectedScenario.prTitle}
            </h3>

            <p className="text-[11px] text-[#a1a1aa] mt-0.5 font-mono">
              Branch: <code className="text-blue-400">{selectedScenario.branch}</code> • Author: @{selectedScenario.author} • Target: <code className="text-amber-300">{selectedScenario.filename}</code>
            </p>
          </div>
        </div>

        {activeRun && (
          <div className="flex items-center space-x-3 border-t md:border-t-0 md:border-l border-[#1a1a1a] pt-3 md:pt-0 md:pl-5 shrink-0">
            <div className="text-right">
              <div className="text-xs font-bold text-white font-mono">
                Duration: {((activeRun.executionTimeMs || 2100) / 1000).toFixed(1)}s
              </div>
              <div className="text-[10px] text-[#a1a1aa] font-mono">
                Tokens: ~{activeRun.tokensUsed || 340}
              </div>
            </div>
            <div className="w-3 h-3 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80]" />
          </div>
        )}
      </div>

      {/* Main Agent Workspace: Tabs & Content */}
      <div className="space-y-4">
        {/* View Mode Navigation Bar */}
        <div className="flex items-center space-x-2 border-b border-[#1a1a1a] pb-2 overflow-x-auto">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-medium transition-all flex items-center space-x-2 ${
              viewMode === 'overview'
                ? 'bg-[#141414] text-white border border-white/20 shadow-sm'
                : 'text-[#a1a1aa] hover:text-white hover:bg-[#0c0c0c]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Triage Summary & Fix</span>
          </button>

          <button
            onClick={() => setViewMode('diff')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-medium transition-all flex items-center space-x-2 ${
              viewMode === 'diff'
                ? 'bg-[#141414] text-white border border-white/20 shadow-sm'
                : 'text-[#a1a1aa] hover:text-white hover:bg-[#0c0c0c]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-[#4ade80]" />
            <span>Unified Code Patch</span>
          </button>

          <button
            onClick={() => setViewMode('terminal')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-medium transition-all flex items-center space-x-2 ${
              viewMode === 'terminal'
                ? 'bg-[#141414] text-white border border-white/20 shadow-sm'
                : 'text-[#a1a1aa] hover:text-white hover:bg-[#0c0c0c]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>Sandbox Terminal Logs</span>
          </button>

          <button
            onClick={() => setViewMode('github')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-medium transition-all flex items-center space-x-2 ${
              viewMode === 'github'
                ? 'bg-[#141414] text-white border border-white/20 shadow-sm'
                : 'text-[#a1a1aa] hover:text-white hover:bg-[#0c0c0c]'
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5 text-amber-400" />
            <span>GitHub PR Review Comment</span>
          </button>
        </div>

        {/* Tab 1: Overview & Root Cause Analysis */}
        {viewMode === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Triage Analysis Card */}
            <div className="lg:col-span-7 space-y-6">
              {activeRun ? (
                <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center space-x-2 border-b border-[#1a1a1a] pb-3">
                    <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                    <h3 className="font-serif italic text-base text-white">Root Cause & Remediation Plan</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-[#080808] p-4 rounded-lg border border-[#1a1a1a]">
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
                        Root Cause Pinpointed
                      </span>
                      <p className="text-xs text-white/90 leading-relaxed font-sans">
                        {activeRun.rootCauseSummary || selectedScenario.errorMessage}
                      </p>
                    </div>

                    <div className="bg-[#080808] p-4 rounded-lg border border-[#1a1a1a]">
                      <span className="text-[10px] font-mono font-bold text-[#4ade80] uppercase tracking-widest block mb-1">
                        Remediation Steps Applied by Gemini AI
                      </span>
                      <p className="text-xs text-[#dcdcdc] whitespace-pre-line leading-relaxed font-mono">
                        {activeRun.fixExplanation || '• Corrected conditional comparison logic.\n• Ensured precision formatting on return values.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-[#a1a1aa] font-mono">
                      Hotfix Commit: <code className="text-[#4ade80]">{activeRun.commitSha || 'a4f891b'}</code>
                    </span>

                    <button
                      onClick={() => setViewMode('diff')}
                      className="px-3.5 py-1.5 text-xs font-mono font-bold bg-[#4ade80] hover:bg-[#3ecf73] text-black rounded-md transition-all shadow-md flex items-center space-x-1 uppercase tracking-wider"
                    >
                      <span>View Patch Diff</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-8 shadow-2xl text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#080808] border border-[#1a1a1a] flex items-center justify-center mx-auto text-amber-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif italic text-base text-white">Failing CI Check Diagnostic</h3>
                    <p className="text-xs text-[#a1a1aa] max-w-md mx-auto mt-1 font-sans">
                      {selectedScenario.errorMessage}
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleRunAgent}
                      disabled={isRunning}
                      className="px-5 py-2.5 bg-[#4ade80] hover:bg-[#3ecf73] text-black font-bold text-xs rounded-md shadow-[0_0_12px_rgba(74,222,128,0.25)] transition-all inline-flex items-center space-x-2 font-mono uppercase tracking-wider"
                    >
                      <Zap className="w-4 h-4 fill-black text-black" />
                      <span>Start Autonomous Self-Healing Agent</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Stack Trace Box */}
              <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-5 shadow-2xl font-mono text-xs space-y-2">
                <div className="text-[#a1a1aa] font-bold flex items-center justify-between border-b border-[#1a1a1a] pb-2 text-[11px] uppercase tracking-wider">
                  <span className="text-red-400">Raw Stack Trace from CI/CD Pipeline</span>
                  <span>{selectedScenario.category}</span>
                </div>
                <pre className="text-red-300/90 whitespace-pre-wrap break-all overflow-x-auto max-h-48 leading-relaxed p-2 text-[11px]">
                  {selectedScenario.stackTrace}
                </pre>
              </div>
            </div>

            {/* Right: Sandbox Terminal Stream */}
            <div className="lg:col-span-5">
              <TerminalLogs
                logs={activeRun ? activeRun.logs : [
                  {
                    id: 'init',
                    timestamp: new Date().toISOString(),
                    type: 'info',
                    message: 'Waiting for webhook or agent trigger...',
                  }
                ]}
                status={activeRun ? activeRun.status : 'idle'}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Code Diff */}
        {viewMode === 'diff' && (
          <DiffViewer
            filename={selectedScenario.filename}
            originalCode={customMode ? customCode : selectedScenario.buggyCode}
            patchedCode={activeRun?.patchedCode || selectedScenario.buggyCode}
          />
        )}

        {/* Tab 3: Sandbox Terminal */}
        {viewMode === 'terminal' && (
          <TerminalLogs
            logs={activeRun ? activeRun.logs : []}
            status={activeRun ? activeRun.status : 'idle'}
          />
        )}

        {/* Tab 4: GitHub PR Mockup */}
        {viewMode === 'github' && (
          <GithubPRMockup
            run={activeRun || {
              id: 'demo',
              webhookId: 'demo',
              repoOwner: selectedScenario.repoOwner,
              repoName: selectedScenario.repoName,
              prNumber: selectedScenario.prNumber,
              branch: selectedScenario.branch,
              status: 'resolved',
              logs: [],
              filename: selectedScenario.filename,
              attempts: 1,
              maxAttempts: 3,
              tokensUsed: 320,
              executionTimeMs: 2100,
              rootCauseSummary: 'Off-by-one comparison on threshold boundary.',
              fixExplanation: '• Corrected conditional comparison logic.',
              diff: '--- a/file.ts\n+++ b/file.ts',
            }}
            githubToken={settings.githubToken}
            onLivePush={handleLivePushToGithub}
            isPushing={isLivePushing}
          />
        )}
      </div>
    </div>
  );
};
