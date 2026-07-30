import React from 'react';
import { WebhookEvent, ThemeMode } from '../types';
import { Radio, Copy, CheckCircle2, Play, RefreshCw, Trash2, Code2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

interface WebhookInspectorProps {
  events: WebhookEvent[];
  onTriggerTriage: (event: WebhookEvent) => void;
  onRefresh: () => void;
  onClear: () => void;
  theme?: ThemeMode;
}

export const WebhookInspector: React.FC<WebhookInspectorProps> = ({ events, onTriggerTriage, onRefresh, onClear, theme = 'dark' }) => {
  const [copiedUrl, setCopiedUrl] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<WebhookEvent | null>(events[0] || null);
  const [isPinging, setIsPinging] = React.useState(false);

  React.useEffect(() => {
    if (events.length > 0 && !selectedEvent) {
      setSelectedEvent(events[0]);
    }
  }, [events, selectedEvent]);

  // Derive absolute webhook endpoint URL
  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhook` : 'https://your-domain.com/api/webhook';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleTestPing = async () => {
    setIsPinging(true);
    try {
      await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-GitHub-Event': 'check_run',
          'X-GitHub-Delivery': `ping_${Date.now()}`,
        },
        body: JSON.stringify({
          action: 'completed',
          check_run: {
            name: 'CI / Jest Unit Tests',
            status: 'completed',
            conclusion: 'failure',
          },
          repository: {
            name: 'checkout-service',
            owner: { login: 'acme-inc' },
            full_name: 'acme-inc/checkout-service',
          },
          pull_request: {
            number: 142,
            title: 'Add volume discount calculation',
            user: { login: 'alex-dev' },
            head: { ref: 'feat/volume-discounts' },
          },
        }),
      });
      onRefresh();
    } catch (err) {
      console.error('Failed to send webhook ping:', err);
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Webhook Endpoint Banner */}
      <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <h2 className="text-lg font-serif italic text-white">Live GitHub Webhook Endpoint</h2>
            </div>
            <p className="text-xs text-[#a1a1aa] mt-1 max-w-2xl font-sans">
              Configure this payload URL in your GitHub Repository settings under <b>Settings &gt; Webhooks</b>.
              The endpoint responds with <code className="text-cyan-300 font-mono">202 Accepted</code> and queues the E2B sandbox fixer.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleTestPing}
              disabled={isPinging}
              className="px-3.5 py-2 text-xs font-mono font-bold bg-[#141414] hover:bg-[#1a1a1a] text-cyan-400 border border-cyan-500/30 rounded-md transition-all shadow-md flex items-center space-x-1.5 disabled:opacity-50 uppercase tracking-wider"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
              <span>Simulate Webhook Delivery</span>
            </button>
          </div>
        </div>

        {/* URL Box */}
        <div className="mt-4 bg-[#080808] p-3.5 rounded-lg border border-[#1a1a1a] flex items-center justify-between font-mono text-xs text-cyan-300">
          <span className="truncate pr-4">{webhookUrl}</span>
          <button
            onClick={handleCopyUrl}
            className="px-3 py-1.5 bg-[#141414] hover:bg-[#1a1a1a] text-[#dcdcdc] rounded text-xs font-mono font-medium transition-colors shrink-0 flex items-center space-x-1 border border-white/10"
          >
            {copiedUrl ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80]" />
                <span className="text-[#4ade80]">Copied Endpoint!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy URL</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Received Webhooks List & Payload Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Events Feed List */}
        <div className="lg:col-span-5 bg-[#050505] border border-[#1a1a1a] rounded-xl p-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-3 px-1">
            <div className="flex items-center space-x-2">
              <span className="font-serif italic text-base text-white">Captured Events</span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-[#0c0c0c] text-cyan-400 rounded-full border border-cyan-500/30">
                {events.length}
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={onRefresh}
                className="p-1.5 text-[#a1a1aa] hover:text-white hover:bg-[#141414] rounded transition-colors"
                title="Refresh log feed"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={onClear}
                className="p-1.5 text-[#a1a1aa] hover:text-red-400 hover:bg-[#141414] rounded transition-colors"
                title="Clear webhooks"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
            {events.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-[#1a1a1a] rounded-lg">
                <Radio className="w-8 h-8 text-white/20 mx-auto mb-2 animate-pulse" />
                <p className="text-xs font-mono text-[#a1a1aa] uppercase tracking-wider">No webhook deliveries yet</p>
                <p className="text-[11px] text-white/40 mt-1 font-sans">
                  Click "Simulate Webhook Delivery" above or trigger a real GitHub webhook event.
                </p>
              </div>
            ) : (
              events.map((ev) => {
                const isSelected = selectedEvent?.id === ev.id;
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-[#0c0c0c] border-cyan-500/50 shadow-md'
                        : 'bg-[#080808] border-[#1a1a1a] hover:bg-[#0c0c0c]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                        {ev.event}.{ev.action}
                      </span>
                      <span className="text-[10px] font-mono text-white/40">
                        {ev.timestamp.slice(11, 19)}
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-xs text-white">
                        {ev.repository.fullName} #{ev.pullRequest.number}
                      </div>
                      <div className="text-xs text-[#a1a1aa] truncate mt-0.5">
                        {ev.pullRequest.title}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#1a1a1a]">
                      <span className="text-[10px] font-mono text-white/40">
                        ID: {ev.id.slice(0, 12)}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTriggerTriage(ev);
                        }}
                        className="px-2.5 py-1 text-[10px] font-mono font-bold bg-[#4ade80]/10 hover:bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30 rounded transition-colors flex items-center gap-1 uppercase tracking-wider"
                      >
                        <Play className="w-3 h-3 fill-[#4ade80]" />
                        <span>Run Fixer</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Payload Inspector */}
        <div className="lg:col-span-7 bg-[#050505] border border-[#1a1a1a] rounded-xl p-5 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-3">
            <div className="flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <h3 className="font-serif italic text-base text-white">Raw Webhook Payload JSON</h3>
            </div>
            {selectedEvent && (
              <span className="text-xs font-mono text-white/40">
                Delivery ID: {selectedEvent.id}
              </span>
            )}
          </div>

          <div className="mt-4 flex-1">
            {selectedEvent ? (
              <pre className="p-4 rounded-lg bg-[#080808] border border-[#1a1a1a] font-mono text-xs text-[#dcdcdc] overflow-x-auto max-h-[480px] leading-relaxed">
                {selectedEvent.rawPayload}
              </pre>
            ) : (
              <div className="h-64 flex items-center justify-center text-white/30 text-xs font-mono">
                Select a webhook delivery from the list to view header & body JSON payload
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
