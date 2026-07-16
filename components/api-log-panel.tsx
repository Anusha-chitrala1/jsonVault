'use client';

import * as React from 'react';
import { subscribe, type LogEntry } from '@/lib/api-logger';
import { X, Activity, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

export function ApiLogPanel() {
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [open, setOpen] = React.useState(false);
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => { return subscribe(setLogs); }, []);

  if (!visible) return null;

  const pending = logs.filter((l) => l.status === null).length;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-xl border border-border/60 bg-card shadow-2xl text-xs font-mono overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 bg-card/80 border-b border-border/40 cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        <Activity className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="font-semibold text-foreground flex-1">API Calls</span>
        {pending > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px]">
            {pending} pending
          </span>
        )}
        <span className="text-muted-foreground text-[10px]">{logs.length} total</span>
        {open ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronUp className="h-3 w-3 text-muted-foreground" />}
        <button
          onClick={(e) => { e.stopPropagation(); setVisible(false); }}
          className="ml-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {open && (
        <>
          <div className="max-h-64 overflow-y-auto divide-y divide-border/30">
            {logs.length === 0 && (
              <div className="px-3 py-4 text-center text-muted-foreground">No API calls yet</div>
            )}
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 px-3 py-1.5 hover:bg-accent/20">
                <span className={`shrink-0 px-1 rounded text-[10px] font-bold ${methodColor(log.method)}`}>
                  {log.method}
                </span>
                <span className="flex-1 truncate text-muted-foreground" title={log.path}>
                  {log.path.replace('/rest/v1/', '')}
                </span>
                <span className={`shrink-0 ${statusColor(log.status)}`}>
                  {log.status ?? '…'}
                </span>
                {log.duration !== null && (
                  <span className="shrink-0 text-muted-foreground">{log.duration}ms</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end px-3 py-1.5 border-t border-border/40">
            <button
              onClick={() => setLogs([])}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function methodColor(method: string) {
  switch (method) {
    case 'GET': return 'bg-blue-500/20 text-blue-400';
    case 'POST': return 'bg-green-500/20 text-green-400';
    case 'PATCH': return 'bg-yellow-500/20 text-yellow-400';
    case 'DELETE': return 'bg-red-500/20 text-red-400';
    default: return 'bg-muted text-muted-foreground';
  }
}

function statusColor(status: number | null) {
  if (status === null) return 'text-yellow-400';
  if (status < 300) return 'text-green-400';
  if (status < 400) return 'text-blue-400';
  return 'text-red-400';
}
