import EditorPageClient from './editor-client';

export function generateStaticParams() {
  return [{ id: 'new' }];
}

export default function Page() {
  return <EditorPageClient />;
}
