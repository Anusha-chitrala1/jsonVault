'use client';

import * as React from 'react';
import {
  Braces, Server, Database, Shield, Cloud, Code2, GitBranch,
  Folder, BookOpen, Key, Lock, Zap, ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const sections = [
  {
    id: 'overview',
    icon: BookOpen,
    title: 'Overview',
    content: `JsonVault is a full-stack JSON document management platform built with Next.js 15, React, TypeScript, Tailwind CSS, and Supabase.

The application provides a premium split-screen Monaco editor with a synchronized live JSON tree view, version history, secure sharing, advanced search, and a polished dashboard inspired by VS Code and GitHub.`,
  },
  {
    id: 'architecture',
    icon: Server,
    title: 'Architecture',
    content: `Frontend: Next.js 15 App Router with React Server Components and client components for interactive features.

Backend: Supabase provides the PostgreSQL database, authentication, and row-level security policies.

Editor: Monaco Editor (the engine behind VS Code) powers the JSON editing experience with IntelliSense and syntax highlighting.

Tree View: A custom React component renders a live, synchronized JSON tree that supports expand/collapse, search, and inline editing.

State: React hooks and context manage local state. Supabase handles all persistent data.`,
  },
  {
    id: 'structure',
    icon: Folder,
    title: 'Folder Structure',
    code: `app/
  (marketing)/        # Public marketing pages
    pricing/
    features/
    faq/
    about/
    contact/
  (app)/              # Authenticated app pages
    dashboard/
    editor/[id]/
    profile/
    settings/
    api-keys/
    activity/
    notifications/
  login/
  register/
  forgot-password/
  reset-password/
  shared/[token]/     # Public shared blob view
components/
  ui/                 # shadcn/ui primitives
  json-editor.tsx
  json-tree-view.tsx
  app-sidebar.tsx
  command-palette.tsx
  ...
lib/
  supabase.ts
  types.ts
  utils.ts
hooks/
  use-toast.ts`,
  },
  {
    id: 'database',
    icon: Database,
    title: 'Database Schema',
    content: `The database uses Supabase (PostgreSQL) with the following tables:

- blobs: Core JSON documents with title, description, content (jsonb), visibility, status, tags, and ownership.
- blob_versions: Version snapshots for each blob, with content, version number, and timestamp.
- shares: Sharing links with tokens, link type, password protection, and expiry.
- folders: Organizational folders for grouping blobs.
- tags: Per-user tag dictionary for autocomplete.
- favorites: Explicit favorite markers.
- api_keys: User-generated API keys for programmatic access.
- audit_logs: Activity log entries for user actions.
- notifications: In-app notifications.

All tables have row-level security enabled with owner-scoped policies.`,
  },
  {
    id: 'auth',
    icon: Lock,
    title: 'Authentication',
    content: `Authentication uses Supabase Auth with email/password sign-in.

Flow:
1. User registers with email and password via supabase.auth.signUp().
2. Supabase creates the user in auth.users and returns a session.
3. The AuthProvider context listens to onAuthStateChange and updates the session.
4. Protected routes check the session and redirect to /login if unauthenticated.
5. Sign out calls supabase.auth.signOut() and clears the session.

Email confirmation is disabled for development. Sessions persist across reloads via Supabase's built-in session management.`,
  },
  {
    id: 'rls',
    icon: Shield,
    title: 'Row-Level Security',
    content: `Every table has RLS enabled with four policies (SELECT, INSERT, UPDATE, DELETE), each scoped to the authenticated user via auth.uid() = user_id.

Owner columns default to auth.uid() so client inserts that omit user_id still satisfy the WITH CHECK constraint.

Public blobs and active share links have additional SELECT policies for anon + authenticated roles, enabling public access without a session.`,
  },
  {
    id: 'api',
    icon: Code2,
    title: 'API Reference',
    content: `Authentication:
- POST /auth/register — Create account
- POST /auth/login — Sign in
- POST /auth/logout — Sign out
- POST /auth/refresh — Refresh session

Blobs:
- GET /blobs — List user's blobs
- POST /blobs — Create blob
- GET /blobs/:id — Get single blob
- PUT /blobs/:id — Update blob
- DELETE /blobs/:id — Delete blob
- POST /blobs/:id/share — Create share link
- POST /blobs/:id/archive — Archive/restore
- POST /blobs/:id/favorite — Toggle favorite

Versions:
- POST /versions — Create version
- GET /versions/:blobId — List versions

Search:
- GET /search — Search blobs with filters

All endpoints require authentication except public share link access.`,
  },
  {
    id: 'deployment',
    icon: Cloud,
    title: 'Deployment',
    content: `JsonVault is designed for deployment on Cloudflare:

- Frontend: Cloudflare Pages (Next.js)
- Backend: Supabase (PostgreSQL + Auth + Edge Functions)
- Database: Supabase PostgreSQL (D1-compatible patterns)
- Storage: Supabase Storage (R2-compatible patterns)

Environment variables are pre-configured in the hosted environment. No manual setup is required for the database or auth.`,
  },
];

export default function DocsPage() {
  const [active, setActive] = React.useState('overview');
  const activeSection = sections.find((s) => s.id === active);

  return (
    <div className="pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[220px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-20 lg:h-fit">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
              Documentation
            </div>
            <nav className="space-y-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={cn(
                    'flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm font-medium transition-colors text-left',
                    active === s.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  )}
                >
                  <s.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{s.title}</span>
                  {active === s.id && <ChevronRight className="h-3 w-3 ml-auto" />}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="min-w-0">
            {activeSection && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <activeSection.icon className="h-5 w-5" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight">{activeSection.title}</h1>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {activeSection.content?.split('\n\n').map((para, i) => (
                    <p key={i} className="text-muted-foreground leading-relaxed mb-4 whitespace-pre-wrap">
                      {para}
                    </p>
                  ))}
                  {activeSection.code && (
                    <pre className="bg-card border border-border/50 rounded-lg p-4 overflow-auto scrollbar-thin text-xs font-mono">
                      <code>{activeSection.code}</code>
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
