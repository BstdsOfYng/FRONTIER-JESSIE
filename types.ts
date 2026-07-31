import React from 'react';
import { LogEntry } from '../types';
import { Terminal, Copy, CheckCircle2, AlertCircle, Info, Sparkles, Box } from 'lucide-react';

interface TerminalLogsProps {
  logs: LogEntry[];
  status: string;
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({ logs, status }) => {
  const [copied, setCopied] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp.slice(11, 19)}] [${l.type.toUpperCase()}] ${l.message}\n${l.details ? `\n${l.details}\n` : ''}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'cmd':
        return <Terminal className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />;
      case 'error':
        return <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />;
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80] shrink-0 mt-0.5" />;
      case 'ai':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5 animate-pulse" />;
      case 'sandbox':
        return <Box className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden shadow-2xl font-mono text-[13px] leading-relaxed">
      {/* Terminal Bar */}
      <div className="bg-[#050505] px-4 py-2.5 border-b border-[#1a1a1a] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 opacity-40">
            <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" />
          </div>
          <span className="text-[#a1a1aa] text-xs font-semibold ml-2 tracking-wide uppercase">e2b-devcontainer / bash</span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-tight uppercase bg-[#0c0c0c] text-[#4ade80] border border-[#4ade80]/30 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'resolved' ? 'bg-[#4ade80] shadow-[0_0_6px_#4ade80]' : status === 'failed' ? 'bg-red-400' : 'bg-amber-400 animate-ping'}`} />
            {status.toUpperCase()}
          </span>

          <button
            onClick={handleCopyLogs}
            className="text-[#a1a1aa] hover:text-white p-1 rounded hover:bg-[#1a1a1a] transition-colors"
            title="Copy raw logs"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Log Body */}
      <div ref={scrollRef} className="p-5 space-y-3 overflow-y-auto max-h-[380px] min-h-[220px]">
        {logs.map((log) => (
          <div key={log.id} className="space-y-1">
            <div className="flex items-start space-x-2 text-[#dcdcdc]">
              {getLogIcon(log.type)}
              <span className="text-white/40 text-[11px] shrink-0 pt-0.5 font-mono">[{log.timestamp.slice(11, 19)}]</span>
              <span className={`font-mono text-[12px] ${
                log.type === 'error' ? 'text-red-400' :
                log.type === 'success' ? 'text-[#4ade80]' :
                log.type === 'cmd' ? 'text-blue-400' :
                log.type === 'ai' ? 'text-purple-300' :
                log.type === 'sandbox' ? 'text-amber-300' : 'text-[#dcdcdc]'
              }`}>
                {log.message}
              </span>
            </div>

            {log.details && (
              <div className="ml-8 p-3 rounded bg-[#050505] border border-[#1a1a1a] text-[#dcdcdc]/90 whitespace-pre-wrap break-all text-[11px] font-mono leading-relaxed overflow-x-auto">
                {log.details}
              </div>
            )}
          </div>
        ))}
        {status !== 'resolved' && status !== 'failed' && (
          <div className="mt-4 inline-block w-2 h-5 bg-[#4ade80] animate-pulse" />
        )}
      </div>
    </div>
  );
};
