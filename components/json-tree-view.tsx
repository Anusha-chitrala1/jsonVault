'use client';

import * as React from 'react';
import {
  ChevronRight,
  ChevronDown,
  Copy,
  Trash2,
  Plus,
  Braces,
  Brackets,
  Type,
  Hash,
  ToggleLeft,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface JsonNodeProps {
  data: unknown;
  keyName: string | null;
  path: (string | number)[];
  onEdit: (path: (string | number)[], value: unknown) => void;
  onDelete: (path: (string | number)[], isIndex: boolean) => void;
  onAdd: (path: (string | number)[], type: 'property' | 'object' | 'array') => void;
  defaultExpanded?: boolean;
  depth?: number;
  searchQuery?: string;
}

function getTypeIcon(value: unknown) {
  if (value === null) return <X className="h-3.5 w-3.5 text-muted-foreground" />;
  if (Array.isArray(value)) return <Brackets className="h-3.5 w-3.5 text-chart-2" />;
  if (typeof value === 'object') return <Braces className="h-3.5 w-3.5 text-chart-1" />;
  if (typeof value === 'number') return <Hash className="h-3.5 w-3.5 text-chart-4" />;
  if (typeof value === 'boolean') return <ToggleLeft className="h-3.5 w-3.5 text-chart-5" />;
  return <Type className="h-3.5 w-3.5 text-chart-3" />;
}

function valueColor(value: unknown): string {
  if (value === null) return 'text-muted-foreground';
  if (typeof value === 'string') return 'text-chart-3';
  if (typeof value === 'number') return 'text-chart-4';
  if (typeof value === 'boolean') return 'text-chart-5';
  return 'text-foreground';
}

function matchesSearch(value: unknown, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  if (typeof value === 'string') return value.toLowerCase().includes(q);
  if (value === null || typeof value !== 'object') return String(value).toLowerCase().includes(q);
  return Object.keys(value as object).some((k) => k.toLowerCase().includes(q)) ||
    Object.values(value as object).some((v) => matchesSearch(v, query));
}

function JsonNode({
  data,
  keyName,
  path,
  onEdit,
  onDelete,
  onAdd,
  defaultExpanded = true,
  depth = 0,
  searchQuery = '',
}: JsonNodeProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded || depth < 2);
  const [editing, setEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState('');
  const isObject = data !== null && typeof data === 'object';
  const isArray = Array.isArray(data);
  const entries = isObject
    ? isArray
      ? (data as unknown[]).map((v, i) => [String(i), v] as const)
      : Object.entries(data as Record<string, unknown>)
    : [];

  const handleStartEdit = () => {
    if (isObject) return;
    setEditValue(typeof data === 'string' ? data : String(data));
    setEditing(true);
  };

  const handleSaveEdit = () => {
    let parsed: unknown = editValue;
    if (typeof data === 'number') parsed = Number(editValue);
    else if (typeof data === 'boolean') parsed = editValue === 'true';
    onEdit(path, parsed);
    setEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast({ title: 'Copied to clipboard' });
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          'group flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-accent/40 transition-colors',
          depth === 0 && 'mt-1'
        )}
        style={{ paddingLeft: depth * 16 + 4 }}
      >
        {isObject ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center text-muted-foreground hover:text-foreground shrink-0"
          >
            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        {getTypeIcon(data)}
        {keyName !== null && (
          <span className="text-chart-1 font-medium text-sm">{keyName}</span>
        )}
        {keyName !== null && <span className="text-muted-foreground text-sm">:</span>}
        {isObject ? (
          <span className="text-muted-foreground text-sm ml-1">
            {isArray ? `[${entries.length}]` : `{${entries.length}}`}
          </span>
        ) : editing ? (
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') setEditing(false);
            }}
            className="ml-1 bg-background border border-border rounded px-1.5 py-0 text-sm w-32 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        ) : (
          <span
            className={cn('text-sm ml-1 cursor-text', valueColor(data))}
            onDoubleClick={handleStartEdit}
          >
            {typeof data === 'string' ? `"${data}"` : String(data)}
          </span>
        )}
        <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {isObject && (
            <button
              onClick={() => onAdd(path, 'property')}
              className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground"
              title="Add property"
            >
              <Plus className="h-3 w-3" />
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground"
            title="Copy"
          >
            <Copy className="h-3 w-3" />
          </button>
          {keyName !== null && (
            <button
              onClick={() => onDelete(path, isArray)}
              className="p-1 rounded hover:bg-background text-muted-foreground hover:text-destructive"
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      {isObject && expanded && entries.length > 0 && (
        <div className="animate-fade-in">
          {entries.map(([k, v]) => {
            const childPath = [...path, isArray ? Number(k) : k];
            if (!matchesSearch(v, searchQuery) && !matchesSearch(k, searchQuery)) return null;
            return (
              <JsonNode
                key={k}
                data={v}
                keyName={isArray ? null : k}
                path={childPath}
                onEdit={onEdit}
                onDelete={onDelete}
                onAdd={onAdd}
                depth={depth + 1}
                searchQuery={searchQuery}
              />
            );
          })}
        </div>
      )}
      {isObject && expanded && entries.length === 0 && (
        <div
          className="text-muted-foreground text-xs italic py-0.5"
          style={{ paddingLeft: depth * 16 + 28 }}
        >
          {isArray ? 'empty array' : 'empty object'}
        </div>
      )}
    </div>
  );
}

export interface JsonTreeViewProps {
  data: unknown;
  onChange?: (data: unknown) => void;
  className?: string;
  searchQuery?: string;
}

export function JsonTreeView({ data, onChange, className, searchQuery = '' }: JsonTreeViewProps) {
  const handleEdit = React.useCallback(
    (path: (string | number)[], value: unknown) => {
      if (!onChange) return;
      const newData = structuredClone(data as object);
      setAtPath(newData, path, value);
      onChange(newData);
    },
    [data, onChange]
  );

  const handleDelete = React.useCallback(
    (path: (string | number)[], isIndex: boolean) => {
      if (!onChange) return;
      const newData = structuredClone(data as object);
      deleteAtPath(newData, path, isIndex);
      onChange(newData);
    },
    [data, onChange]
  );

  const handleAdd = React.useCallback(
    (path: (string | number)[], _type: 'property' | 'object' | 'array') => {
      if (!onChange) return;
      const newData = structuredClone(data as object);
      addAtPath(newData, path);
      onChange(newData);
    },
    [data, onChange]
  );

  return (
    <div className={cn('text-sm font-mono scrollbar-thin overflow-auto', className)}>
      <JsonNode
        data={data}
        keyName={null}
        path={[]}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        searchQuery={searchQuery}
      />
    </div>
  );
}

function setAtPath(obj: unknown, path: (string | number)[], value: unknown): void {
  let current: any = obj;
  for (let i = 0; i < path.length - 1; i++) {
    current = current[path[i]];
  }
  current[path[path.length - 1]] = value;
}

function deleteAtPath(obj: unknown, path: (string | number)[], isIndex: boolean): void {
  let current: any = obj;
  for (let i = 0; i < path.length - 1; i++) {
    current = current[path[i]];
  }
  const lastKey = path[path.length - 1];
  if (isIndex && Array.isArray(current)) {
    current.splice(lastKey as number, 1);
  } else {
    delete current[lastKey];
  }
}

function addAtPath(obj: unknown, path: (string | number)[], newKey = 'newKey', newValue: unknown = 'newValue'): void {
  let current: any = obj;
  for (const p of path) {
    current = current[p];
  }
  if (Array.isArray(current)) {
    current.push(newValue);
  } else if (current && typeof current === 'object') {
    let key = newKey;
    let n = 1;
    while (key in current) {
      key = `${newKey}${n++}`;
    }
    current[key] = newValue;
  }
}
