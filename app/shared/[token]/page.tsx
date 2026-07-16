import SharedBlobPage from './shared-client';

// Static export: generate a placeholder; actual token is read client-side via useParams
export function generateStaticParams() {
  return [{ token: '_' }];
}

export default function Page() {
  return <SharedBlobPage />;
}
