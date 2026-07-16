'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

export interface JsonEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  fontSize?: number;
  wordWrap?: boolean;
  showLineNumbers?: boolean;
  className?: string;
}

const MonacoEditor = dynamic(() => import('./monaco-editor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-card/20">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  ),
});

export function JsonEditor({
  value,
  onChange,
  readOnly = false,
  fontSize = 14,
  wordWrap = true,
  showLineNumbers = true,
  className,
}: JsonEditorProps) {
  return (
    <div className={`h-full w-full ${className ?? ''}`}>
      <MonacoEditor
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        fontSize={fontSize}
        wordWrap={wordWrap}
        showLineNumbers={showLineNumbers}
      />
    </div>
  );
}
