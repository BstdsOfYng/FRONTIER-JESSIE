"use client";

interface DiffViewProps {
  diff: string;
}

export default function DiffView({ diff }: DiffViewProps) {
  const lines = diff.split("\n");

  return (
    <div className="bg-[#0a0c12] rounded-lg border border-surface-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-surface-raised border-b border-surface-border">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16h16M8 16l4-4 4 4m0-8l-4 4-4-4" />
        </svg>
        <span className="text-xs font-medium text-gray-400">Diff View</span>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-6 font-mono">
        {lines.map((line, i) => {
          let className = "";
          if (line.startsWith("+")) className = "diff-added block";
          else if (line.startsWith("-")) className = "diff-removed block";
          else if (line.startsWith("@@")) className = "text-cyan-400 block";
          else className = "text-gray-400 block";

          return (
            <span key={i} className={className}>
              <span className="select-none text-gray-600 w-8 inline-block text-right mr-4">
                {i + 1}
              </span>
              {line}
            </span>
          );
        })}
      </pre>
    </div>
  );
}
