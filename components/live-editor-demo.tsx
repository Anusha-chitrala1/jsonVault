'use client';

import * as React from 'react';
import { JsonEditor } from '@/components/json-editor';
import { JsonTreeView } from '@/components/json-tree-view';
import { Check, AlertCircle, Copy, Download, Minimize2, Maximize2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const sampleJson = `{
  "name": "JsonVault",
  "version": "1.0.0",
  "description": "A modern JSON document management platform",
  "features": [
    "syntax highlighting",
    "live tree view",
    "version history",
    "secure sharing"
  ],
  "settings": {
    "theme": "dark",
    "autoSave": true,
    "fontSize": 14
  },
  "stats": {
    "blobs": 42,
    "shared": 12,
    "storageMB": 8.5
  }
}`;

export function LiveEditorDemo() {
  const [value, setValue] = React.useState(sampleJson);
  const [error, setError] = React.useState<string | null>(null);
  const [parsed, setParsed] = React.useState<unknown>(null);

  React.useEffect(() => {
    try {
      setParsed(JSON.parse(value));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }, [value]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast({ title: 'Copied to clipboard' });
  };

  const handleDownload = () => {
    const blob = new Blob([value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blob.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFormat = () => {
    try {
      setValue(JSON.stringify(JSON.parse(value), null, 2));
    } catch {
      toast({ title: 'Cannot format invalid JSON', variant: 'destructive' });
    }
  };

  const handleMinify = () => {
    try {
      setValue(JSON.stringify(JSON.parse(value)));
    } catch {
      toast({ title: 'Cannot minify invalid JSON', variant: 'destructive' });
    }
  };

  return (
    <div className="glass-card rounded-2xl shadow-2xl shadow-primary/5 overflow-hidden border-2">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-card/40">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
            <div className="h-3 w-3 rounded-full bg-green-400/70" />
          </div>
          <span className="ml-2 text-xs text-muted-foreground font-mono">blob.json</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleFormat} className="p-1.5 rounded hover:bg-accent/50 text-muted-foreground hover:text-foreground" title="Format">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={handleMinify} className="p-1.5 rounded hover:bg-accent/50 text-muted-foreground hover:text-foreground" title="Minify">
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={handleCopy} className="p-1.5 rounded hover:bg-accent/50 text-muted-foreground hover:text-foreground" title="Copy">
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button onClick={handleDownload} className="p-1.5 rounded hover:bg-accent/50 text-muted-foreground hover:text-foreground" title="Download">
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
        <div className="h-[320px] md:h-[380px]">
          <JsonEditor value={value} onChange={setValue} />
        </div>
        <div className="h-[320px] md:h-[380px] bg-card/20 overflow-auto p-3 scrollbar-thin">
          <div className="text-xs text-muted-foreground mb-2 font-sans font-medium uppercase tracking-wide">Tree View</div>
          {parsed !== null && (
            <JsonTreeView data={parsed} onChange={(d) => setValue(JSON.stringify(d, null, 2))} />
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 border-t border-border/50 bg-card/40">
        {error ? (
          <>
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-xs text-destructive font-mono">{error}</span>
          </>
        ) : (
          <>
            <Check className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground font-mono">Valid JSON</span>
            <span className="ml-auto text-xs text-muted-foreground font-mono">
              {new Blob([value]).size} bytes
            </span>
          </>
        )}
      </div>
    </div>
  );
}
