import React from 'react';
import { FileCode, CheckCircle2, Copy, ArrowRight } from 'lucide-react';

interface DiffViewerProps {
  filename: string;
  originalCode: string;
  patchedCode: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ filename, originalCode, patchedCode }) => {
  const [copied, setCopied] = React.useState(false);

  const origLines = originalCode ? originalCode.split('\n') : [];
  const patchLines = patchedCode ? patchedCode.split('\n') : [];

  const handleCopy = () => {
    navigator.clipboard.writeText(patchedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl overflow-hidden shadow-2xl">
      <div className="bg-[#0a0a0a] px-4 py-3 border-b border-[#1a1a1a] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileCode className="w-4 h-4 text-[#4ade80]" />
          <span className="font-mono text-xs font-bold text-white">{filename}</span>
          <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/30 uppercase tracking-wider">
            Unified Diff Patch
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="px-2.5 py-1 text-xs font-mono bg-[#141414] hover:bg-[#1a1a1a] text-[#dcdcdc] rounded transition-colors flex items-center space-x-1 border border-white/10"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80]" />
              <span className="text-[#4ade80]">Copied Patch</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Fix</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1a1a1a] font-mono text-xs overflow-x-auto max-h-[460px]">
        {/* Left Side: Original Code */}
        <div className="bg-[#080808] p-3 overflow-y-auto">
          <div className="text-[#a1a1aa] font-semibold mb-2 flex items-center justify-between pb-1 border-b border-[#1a1a1a] text-[10px] uppercase tracking-wider">
            <span className="text-red-400">🔴 Original Code (Failing)</span>
            <span>{origLines.length} lines</span>
          </div>
          <div className="space-y-0.5 text-[#dcdcdc]">
            {origLines.map((line, idx) => {
              const isModified = patchLines[idx] !== line;
              return (
                <div
                  key={idx}
                  className={`flex items-start px-2 py-0.5 rounded ${
                    isModified && line ? 'bg-red-950/40 text-red-200 border-l-2 border-red-500' : 'hover:bg-[#141414]'
                  }`}
                >
                  <span className="text-white/30 select-none w-8 text-right pr-3 shrink-0 font-mono">{idx + 1}</span>
                  <pre className="whitespace-pre-wrap break-all font-mono text-[11px]">{line || ' '}</pre>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Gemini Patched Code */}
        <div className="bg-[#050505] p-3 overflow-y-auto">
          <div className="text-[#a1a1aa] font-semibold mb-2 flex items-center justify-between pb-1 border-b border-[#1a1a1a] text-[10px] uppercase tracking-wider">
            <span className="text-[#4ade80] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Gemini Hotfix (Passing Tests)
            </span>
            <span>{patchLines.length} lines</span>
          </div>
          <div className="space-y-0.5 text-[#dcdcdc]">
            {patchLines.map((line, idx) => {
              const isModified = origLines[idx] !== line;
              return (
                <div
                  key={idx}
                  className={`flex items-start px-2 py-0.5 rounded ${
                    isModified ? 'bg-[#4ade80]/10 text-[#4ade80] border-l-2 border-[#4ade80] font-medium' : 'hover:bg-[#141414]'
                  }`}
                >
                  <span className="text-white/30 select-none w-8 text-right pr-3 shrink-0 font-mono">{idx + 1}</span>
                  <pre className="whitespace-pre-wrap break-all font-mono text-[11px]">{line || ' '}</pre>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
