'use client';

import * as React from 'react';
import { History, RotateCcw, GitCompare, Clock, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type BlobVersion, formatBytes } from '@/lib/types';
import { cn } from '@/lib/utils';

interface VersionHistoryPanelProps {
  versions: BlobVersion[];
  currentContent: string;
  onRestore: (version: BlobVersion) => void;
  blobId?: string;
}

export function VersionHistoryPanel({
  versions,
  currentContent,
  onRestore,
  blobId,
}: VersionHistoryPanelProps) {
  const [compareWith, setCompareWith] = React.useState<string | null>(null);
  const [showCompare, setShowCompare] = React.useState(false);

  if (!blobId) {
    return (
      <div className="h-full flex items-center justify-center p-4 text-center">
        <div>
          <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Save your blob to start tracking version history.
          </p>
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4 text-center">
        <div>
          <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No versions yet.</p>
        </div>
      </div>
    );
  }

  const currentParsed = (() => {
    try { return JSON.parse(currentContent); } catch { return null; }
  })();

  const compareVersion = versions.find((v) => v.id === compareWith);

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-border/50 bg-card/20">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {versions.length} {versions.length === 1 ? 'version' : 'versions'}
        </span>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {versions.map((v, i) => {
            const isLatest = i === 0;
            const isComparing = compareWith === v.id;
            return (
              <div
                key={v.id}
                className={cn(
                  'rounded-lg border p-2.5 transition-colors cursor-pointer',
                  isComparing
                    ? 'border-primary bg-primary/5'
                    : 'border-border/50 hover:border-primary/30'
                )}
                onClick={() => {
                  if (showCompare) {
                    setCompareWith(isComparing ? null : v.id);
                  }
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">v{v.version_number}</span>
                  {isLatest && (
                    <span className="text-xs text-primary font-medium">Latest</span>
                  )}
                </div>
                {v.message && (
                  <p className="text-xs text-muted-foreground mb-1.5 line-clamp-1">{v.message}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(v.created_at).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">{formatBytes(v.size_bytes)}</div>
                <div className="flex gap-1 mt-2">
                  {showCompare && !isLatest && (
                    <Button
                      size="sm"
                      variant={isComparing ? 'default' : 'outline'}
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCompareWith(isComparing ? null : v.id);
                      }}
                    >
                      <GitCompare className="mr-1 h-3 w-3" />
                      {isComparing ? 'Selected' : 'Compare'}
                    </Button>
                  )}
                  {!isLatest && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRestore(v);
                      }}
                    >
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="border-t border-border/50 p-2 flex gap-1">
        <Button
          size="sm"
          variant={showCompare ? 'default' : 'outline'}
          className="flex-1 h-8 text-xs"
          onClick={() => {
            setShowCompare(!showCompare);
            setCompareWith(null);
          }}
        >
          <GitCompare className="mr-1 h-3 w-3" />
          {showCompare ? 'Cancel' : 'Compare'}
        </Button>
      </div>

      {showCompare && compareVersion && (
        <DiffView
          oldContent={JSON.stringify(compareVersion.content ?? {}, null, 2)}
          newContent={currentContent}
          oldLabel={`v${compareVersion.version_number}`}
          newLabel="Current"
        />
      )}
    </div>
  );
}

function DiffView({
  oldContent,
  newContent,
  oldLabel,
  newLabel,
}: {
  oldContent: string;
  newContent: string;
  oldLabel: string;
  newLabel: string;
}) {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  const maxLines = Math.max(oldLines.length, newLines.length);

  return (
    <div className="border-t border-border/50 p-3 max-h-64 overflow-auto scrollbar-thin bg-card/20">
      <div className="text-xs font-medium mb-2 text-muted-foreground">
        Comparing {oldLabel} → {newLabel}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div>
          <div className="text-muted-foreground mb-1">{oldLabel}</div>
          {Array.from({ length: maxLines }).map((_, i) => {
            const oldLine = oldLines[i] ?? '';
            const newLine = newLines[i] ?? '';
            const changed = oldLine !== newLine;
            return (
              <div
                key={i}
                className={cn(
                  'px-1.5 py-0.5 rounded',
                  changed && 'bg-destructive/10 text-destructive'
                )}
              >
                {oldLine || '\u00A0'}
              </div>
            );
          })}
        </div>
        <div>
          <div className="text-muted-foreground mb-1">{newLabel}</div>
          {Array.from({ length: maxLines }).map((_, i) => {
            const oldLine = oldLines[i] ?? '';
            const newLine = newLines[i] ?? '';
            const changed = oldLine !== newLine;
            return (
              <div
                key={i}
                className={cn(
                  'px-1.5 py-0.5 rounded',
                  changed && 'bg-primary/10 text-primary'
                )}
              >
                {newLine || '\u00A0'}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
