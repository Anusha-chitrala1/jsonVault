'use client';

import * as React from 'react';

export interface MonacoEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  fontSize?: number;
  wordWrap?: boolean;
  showLineNumbers?: boolean;
}

/**
 * Lightweight JSON code editor with syntax highlighting.
 * Uses a textarea overlaid on a highlighted <pre> for editing,
 * avoiding the heavy Monaco bundle / CDN dependency.
 */
export default function MonacoEditor({
  value,
  onChange,
  readOnly = false,
  fontSize = 14,
  wordWrap = true,
  showLineNumbers = true,
}: MonacoEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const preRef = React.useRef<HTMLPreElement>(null);
  const [lineCount, setLineCount] = React.useState(1);

  React.useEffect(() => {
    setLineCount(value.split('\n').length);
  }, [value]);

  const handleScroll = React.useCallback(() => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    const ta = e.currentTarget;
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange?.(newValue);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  }, [value, onChange, readOnly]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0b1120]">
      {/* Line numbers gutter */}
      {showLineNumbers && (
        <div
          className="absolute left-0 top-0 bottom-0 select-none pointer-events-none z-10 text-right text-[#334155] leading-[1.5] pt-3 pb-3"
          style={{
            fontSize: `${fontSize}px`,
            fontFamily: 'var(--font-jetbrains), Menlo, Monaco, monospace',
            width: '48px',
            padding: '12px 8px 12px 0',
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
      )}

      {/* Syntax highlighted layer */}
      <pre
        ref={preRef}
        aria-hidden="true"
        className="absolute inset-0 m-0 overflow-auto pointer-events-none whitespace-pre leading-[1.5] pt-3 pb-3"
        style={{
          fontSize: `${fontSize}px`,
          fontFamily: 'var(--font-jetbrains), Menlo, Monaco, monospace',
          paddingLeft: showLineNumbers ? '56px' : '16px',
          paddingRight: '16px',
          color: '#e2e8f0',
          whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
          wordBreak: wordWrap ? 'break-all' : 'normal',
          tabSize: 2,
        }}
        dangerouslySetInnerHTML={{ __html: highlightJson(value) + '\n' }}
      />

      {/* Transparent textarea on top */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        spellCheck={false}
        className="absolute inset-0 w-full h-full resize-none overflow-auto bg-transparent caret-[#6ee7b7] outline-none whitespace-pre leading-[1.5] pt-3 pb-3"
        style={{
          fontSize: `${fontSize}px`,
          fontFamily: 'var(--font-jetbrains), Menlo, Monaco, monospace',
          paddingLeft: showLineNumbers ? '56px' : '16px',
          paddingRight: '16px',
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
          whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
          wordBreak: wordWrap ? 'break-all' : 'normal',
          tabSize: 2,
          lineHeight: '1.5',
        }}
        placeholder=""
      />
    </div>
  );
}

/**
 * Simple JSON syntax highlighter that produces HTML spans.
 * Escapes HTML first, then wraps tokens in colored spans.
 */
function highlightJson(text: string): string {
  // Escape HTML
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Tokenize: strings (including keys), numbers, booleans, null
  return escaped.replace(
    /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|(\b-?\d+\.?\d*\b)|(\btrue\b|\bfalse\b)|(\bnull\b)/g,
    (match, key, str, num, bool, nul) => {
      if (key) {
        return `<span style="color:#6ee7b7">${key}</span>`;
      }
      if (str) {
        return `<span style="color:#7dd3fc">${str}</span>`;
      }
      if (num) {
        return `<span style="color:#fca5a5">${num}</span>`;
      }
      if (bool) {
        return `<span style="color:#c4b5fd">${bool}</span>`;
      }
      if (nul) {
        return `<span style="color:#64748b">${nul}</span>`;
      }
      return match;
    }
  );
}
