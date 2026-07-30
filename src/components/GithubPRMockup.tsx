import React from 'react';
import ReactMarkdown from 'react-markdown';
import { GitPullRequest, GitCommit, CheckCircle2, Bot, ExternalLink, Send, ArrowUpRight, Sparkles, MessageSquare } from 'lucide-react';
import { SandboxRun } from '../types';

interface GithubPRMockupProps {
  run: SandboxRun;
  githubToken?: string;
  onLivePush?: () => void;
  isPushing?: boolean;
}

export const GithubPRMockup: React.FC<GithubPRMockupProps> = ({ run, githubToken, onLivePush, isPushing }) => {
  const prCommentText = `## 🤖 AI Self-Healing Agent: PR Hotfix Applied

**Status:** ✅ **Tests Passed in E2B Sandbox** (Execution time: ${((run.executionTimeMs || 2100) / 1000).toFixed(1)}s)

### 🔍 Root Cause Analysis
> ${run.rootCauseSummary || 'Comparison operators were strictly > instead of >= on discount thresholds, and returned unrounded floating point values.'}

### 🛠️ Key Remediation Steps
${run.fixExplanation || '• Corrected conditional comparison logic.\n• Ensured precision formatting on return values.'}

### 📦 Hotfix Commit Details
- **Commit SHA:** \`${run.commitSha || 'a4f891b'}\`
- **Pushed Branch:** \`${run.branch}\`
- **Modified File:** \`${run.filename}\`

<details>
<summary><b>View Unified Code Patch Diff</b></summary>

\`\`\`diff
${run.diff || '--- a/file.ts\n+++ b/file.ts\n@@ -1,3 +1,3 @@'}
\`\`\`
</details>

---
*Automated PR Fixer powered by Gemini AI & E2B Sandboxes. No manual triage required.*`;

  return (
    <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl overflow-hidden shadow-2xl">
      {/* GitHub PR Header Mockup */}
      <div className="bg-[#0a0a0a] p-4 border-b border-[#1a1a1a]">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/30 flex items-center gap-1.5 uppercase tracking-wider">
                <GitPullRequest className="w-3.5 h-3.5 text-[#4ade80]" />
                Open
              </span>
              <h3 className="font-serif italic text-white text-base">
                PR #{run.prNumber}: {run.repoOwner}/{run.repoName}
              </h3>
            </div>
            <p className="text-xs text-[#a1a1aa] mt-1 font-mono">
              <span className="text-purple-400 font-semibold">{run.branch}</span> wants to merge into <span className="text-[#dcdcdc]">main</span>
            </p>
          </div>

          <a
            href={`https://github.com/${run.repoOwner}/${run.repoName}/pull/${run.prNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-mono bg-[#141414] hover:bg-[#1a1a1a] text-[#dcdcdc] rounded-md border border-white/10 transition-colors flex items-center space-x-1.5"
          >
            <span>View on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#a1a1aa]" />
          </a>
        </div>
      </div>

      {/* CI Check Pass Banner */}
      <div className="bg-[#4ade80]/10 border-b border-[#4ade80]/20 p-3.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-full bg-[#4ade80]/20 border border-[#4ade80]/40 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#4ade80] flex items-center gap-2 font-mono uppercase tracking-wide">
              <span>All checks have passed</span>
              <span className="px-1.5 py-0.2 text-[9px] bg-[#4ade80]/20 text-[#4ade80] rounded font-mono">
                1 successful check
              </span>
            </div>
            <p className="text-[11px] text-[#4ade80]/80 font-sans">
              CI / Self-Healing Agent — Self-healing hotfix verified passing unit tests in sandbox
            </p>
          </div>
        </div>

        {githubToken && onLivePush && (
          <button
            onClick={onLivePush}
            disabled={isPushing}
            className="px-3.5 py-1.5 text-xs font-mono font-bold bg-[#4ade80] hover:bg-[#3ecf73] text-black rounded-md shadow-[0_0_10px_rgba(74,222,128,0.2)] transition-all flex items-center space-x-1.5 disabled:opacity-50 uppercase tracking-wider"
          >
            {isPushing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Pushing to GitHub...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Push Hotfix to Real Branch</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* GitHub Comment Card */}
      <div className="p-4 bg-[#080808]">
        <div className="border border-[#1a1a1a] rounded-lg overflow-hidden bg-[#050505]">
          {/* Comment Author Bar */}
          <div className="bg-[#0a0a0a] px-4 py-2.5 border-b border-[#1a1a1a] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <span className="font-semibold text-xs text-white">
                pull-request-fixer-bot <span className="text-white/40 font-normal font-mono">commented just now</span>
              </span>
              <span className="px-1.5 py-0.5 text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded font-mono uppercase">
                Bot
              </span>
            </div>
            <MessageSquare className="w-4 h-4 text-[#a1a1aa]" />
          </div>

          {/* Comment Markdown Content */}
          <div className="p-4 text-xs text-[#dcdcdc] leading-relaxed space-y-3 prose prose-invert max-w-none font-sans">
            <div className="markdown-body">
              <ReactMarkdown>{prCommentText}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
