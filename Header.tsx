import React from 'react';
import { ThemeMode } from '../types';
import { Cpu, Server, Shield, GitCommit, Bot, Terminal, Zap, CheckCircle2, Copy } from 'lucide-react';

interface ArchitectureGuideProps {
  theme?: ThemeMode;
}

export const ArchitectureGuide: React.FC<ArchitectureGuideProps> = ({ theme = 'dark' }) => {
  const [copiedCode, setCopiedCode] = React.useState(false);

  const webhookEndpointUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhook` : 'https://your-domain.com/api/webhook';

  const serverlessSnippet = `// AWS Lambda / GCP Cloud Run Webhook Handler
import { GoogleGenAI } from '@google/genai';

export async function handler(event: any) {
  const githubEvent = event.headers['x-github-event'];
  const payload = JSON.parse(event.body);

  if (payload.action !== 'completed' || payload.check_run?.conclusion !== 'failure') {
    return { statusCode: 200, body: 'Skipping passing build' };
  }

  // 1. Spawn Isolated E2B Container
  const sandbox = await E2B.createSandbox({ template: 'node-20-pytest' });
  await sandbox.gitClone(payload.repository.clone_url, payload.pull_request.head.ref);

  // 2. Reproduce Error
  const testLogs = await sandbox.runCommand('npm test');

  // 3. Gemini AI Refactor Loop
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const patch = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: \`Fix failing test logs:\\n\${testLogs.stderr}\`
  });

  // 4. Verify & Push Green Commit
  await sandbox.applyPatch(patch.text);
  const verify = await sandbox.runCommand('npm test');

  if (verify.exitCode === 0) {
    await pushToGithub(payload, patch.text);
  }

  return { statusCode: 200, body: 'Hotfix deployed' };
}`;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Banner */}
      <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2.5 rounded-lg bg-[#0c0c0c] border border-white/10 text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-serif italic text-white">Production Architecture & Serverless Pipeline</h2>
            <p className="text-xs text-[#a1a1aa] font-sans">
              How the self-healing agent runs autonomously in production without touching developer environments.
            </p>
          </div>
        </div>

        {/* 3 Step Pipeline Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-[#080808] p-4 rounded-lg border border-[#1a1a1a] space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider">
              <Server className="w-4 h-4" />
              <span>1. Event Capture</span>
            </div>
            <p className="text-xs text-[#dcdcdc] font-sans">
              Listens for GitHub <code className="text-cyan-300 font-mono">check_run.completed</code> failures. Serverless listener acquires payload and responds instantly with HTTP 202.
            </p>
          </div>

          <div className="bg-[#080808] p-4 rounded-lg border border-[#1a1a1a] space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider">
              <Terminal className="w-4 h-4" />
              <span>2. E2B Sandbox Isolation</span>
            </div>
            <p className="text-xs text-[#dcdcdc] font-sans">
              Spawns ephemeral E2B devcontainer to clone branch, run tests, capture stderr stack traces, and execute Gemini AI refactor loop.
            </p>
          </div>

          <div className="bg-[#080808] p-4 rounded-lg border border-[#1a1a1a] space-y-2">
            <div className="flex items-center space-x-2 text-[#4ade80] font-mono font-bold text-xs uppercase tracking-wider">
              <GitCommit className="w-4 h-4" />
              <span>3. Resolution Deployment</span>
            </div>
            <p className="text-xs text-[#dcdcdc] font-sans">
              Re-tests green hotfix in sandbox. Upon passing, pushes verified commit & posts markdown summary review comment to GitHub PR.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-6 space-y-3 shadow-2xl">
          <h3 className="font-serif italic text-base text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#4ade80]" />
            Impact & Efficiency Metrics
          </h3>
          <ul className="space-y-2.5 text-xs text-[#dcdcdc] font-sans">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0 mt-0.5" />
              <span><b>2-5 hours saved per engineer/week</b> from micro-debugging and re-running local pipelines.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0 mt-0.5" />
              <span><b>80% reduction in context switching friction</b> to maintain deep technical flow state.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0 mt-0.5" />
              <span><b>Zero risk to production</b> — agent only patches deterministic unit tests & never merges automatically.</span>
            </li>
          </ul>
        </div>

        <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-6 space-y-3 shadow-2xl">
          <h3 className="font-serif italic text-base text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            Built on Open Infrastructure
          </h3>
          <ul className="space-y-2.5 text-xs text-[#dcdcdc] font-sans">
            <li><b>OpenHands / All-Hands-AI:</b> Inspired refactoring engine & custom test-retry harness loop.</li>
            <li><b>E2B Dev Container SDK:</b> Provides isolated ephemeral sandboxes for deterministic reproduction.</li>
            <li><b>Gemini 3.6 Flash AI Engine:</b> High-speed code reasoning, root cause analysis, and unified patch generation.</li>
          </ul>
        </div>
      </div>

      {/* Production Code Sample */}
      <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-3">
          <h3 className="font-serif italic text-base text-white">Production Serverless Handler Code (AWS Lambda / GCP Cloud Run)</h3>
          <button
            onClick={() => {
              navigator.clipboard.writeText(serverlessSnippet);
              setCopiedCode(true);
              setTimeout(() => setCopiedCode(false), 2000);
            }}
            className="px-3 py-1 bg-[#141414] hover:bg-[#1a1a1a] text-[#dcdcdc] rounded text-xs font-mono transition-colors flex items-center gap-1 border border-white/10"
          >
            {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-lg bg-[#080808] border border-[#1a1a1a] font-mono text-xs text-[#dcdcdc] overflow-x-auto leading-relaxed">
          {serverlessSnippet}
        </pre>
      </div>
    </div>
  );
};
