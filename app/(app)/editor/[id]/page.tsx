import EditorPageClient from './editor-client';

export function generateStaticParams() {
  // Pre-render /editor/new and a wildcard fallback for existing blob IDs
  // Real blob IDs are handled client-side; the SPA _redirects catches them
  return [{ id: 'new' }, { id: '_' }];
}

export default function Page() {
  return <EditorPageClient />;
}
