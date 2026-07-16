'use client';

import Link from 'next/link';
import {
  Code2, TreePine, History, Share2, Search, Shield, Zap, Download,
  Upload, Copy, Tag, Folder, Star, Archive, Eye, Lock, Globe,
  QrCode, GitCompare, FileJson, Keyboard, Command, Bell, Key,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const featureGroups = [
  {
    title: 'Editor',
    icon: Code2,
    features: [
      { icon: Code2, name: 'Monaco Editor', desc: 'Full IntelliSense, syntax highlighting, and auto-formatting powered by the VS Code engine.' },
      { icon: TreePine, name: 'Live Tree View', desc: 'A synchronized JSON tree that expands, collapses, and edits nodes in real time.' },
      { icon: Zap, name: 'Auto Save', desc: 'Changes are automatically saved with debounced versioning — never lose your work.' },
      { icon: Download, name: 'Import & Export', desc: 'Upload JSON files via drag & drop or file picker. Download or copy with one click.' },
      { icon: Copy, name: 'Copy & Minify', desc: 'Pretty-print, minify, and copy your JSON instantly from the toolbar.' },
    ],
  },
  {
    title: 'Management',
    icon: Folder,
    features: [
      { icon: FileJson, name: 'Blob CRUD', desc: 'Create, edit, duplicate, rename, and delete JSON documents with full control.' },
      { icon: Tag, name: 'Tags & Folders', desc: 'Organize blobs with tags and nested folders for a clean, navigable workspace.' },
      { icon: Star, name: 'Favorites', desc: 'Mark frequently-used blobs as favorites for quick access from the dashboard.' },
      { icon: Archive, name: 'Archive & Restore', desc: 'Archive old blobs without deleting them. Restore anytime with one click.' },
      { icon: Search, name: 'Advanced Search', desc: 'Search by title, content, tags, or date. Apply multiple filters simultaneously.' },
    ],
  },
  {
    title: 'Versioning',
    icon: History,
    features: [
      { icon: History, name: 'Version History', desc: 'Every save creates a snapshot. View the full history of any blob at any time.' },
      { icon: GitCompare, name: 'Compare Versions', desc: 'Side-by-side diff comparison highlights exactly what changed between versions.' },
      { icon: Zap, name: 'One-Click Restore', desc: 'Restore any previous version instantly. No data is ever lost.' },
    ],
  },
  {
    title: 'Sharing',
    icon: Share2,
    features: [
      { icon: Share2, name: 'Share Links', desc: 'Generate public or private links to share your JSON with anyone.' },
      { icon: Eye, name: 'Read Only / Editable', desc: 'Choose whether recipients can only view or also edit the shared blob.' },
      { icon: Lock, name: 'Password Protection', desc: 'Add a password to your share links for an extra layer of security.' },
      { icon: Globe, name: 'Expiry Dates', desc: 'Set custom expiry dates on share links. They auto-expire when the time comes.' },
      { icon: QrCode, name: 'QR Code Sharing', desc: 'Generate QR codes for your share links for easy mobile access.' },
    ],
  },
  {
    title: 'Security & Platform',
    icon: Shield,
    features: [
      { icon: Shield, name: 'Row-Level Security', desc: 'Database-level RLS policies ensure only you can access your own documents.' },
      { icon: Lock, name: 'Secure Auth', desc: 'Email/password authentication with secure session management and refresh tokens.' },
      { icon: Key, name: 'API Keys', desc: 'Generate scoped API keys for programmatic access to your blobs and automation.' },
      { icon: Bell, name: 'Notifications', desc: 'Stay informed with in-app notifications for shares, updates, and activity.' },
      { icon: Command, name: 'Command Palette', desc: 'Press Cmd+K to open the command palette and navigate anywhere instantly.' },
      { icon: Keyboard, name: 'Keyboard Shortcuts', desc: 'Full keyboard navigation support for a fast, efficient workflow.' },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="pt-16">
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-4">Features</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl mx-auto">
            Every tool you need to work with JSON
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            From editing to versioning to sharing, JsonVault brings the best of
            VS Code, GitHub, and Notion into one cohesive JSON management platform.
          </p>
        </div>
      </section>

      {featureGroups.map((group, gi) => (
        <section key={group.title} className={`py-16 ${gi % 2 === 1 ? 'bg-card/20 border-y border-border/50' : ''}`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <group.icon className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{group.title}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {group.features.map((f) => (
                <div key={f.name} className="glass-card rounded-xl p-5 hover:border-primary/30 transition-colors group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3 group-hover:scale-105 transition-transform">
                    <f.icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1.5">{f.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to try all these features?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Start free, no credit card required.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
