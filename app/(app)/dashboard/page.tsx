'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FilePlus2, Search, LayoutGrid, List, Star, Archive, Share2,
  Eye, Lock, Globe, MoreVertical, Trash2, Copy, Download, Clock,
  HardDrive, FileJson, RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { type JsonBlob, formatBytes } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type FilterKey = 'all' | 'favorites' | 'archived' | 'shared' | 'public' | 'private' | 'recent';
type SortKey = 'updated' | 'created' | 'title' | 'size';

function openBlob(id: string) {
  // Navigate to the static /editor/new shell with the blob id as a query param
  // This avoids 404 on /editor/<uuid> which has no static file in the export
  window.location.href = `/editor/new/?id=${id}`;
}

function DashboardContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilter = (searchParams.get('filter') as FilterKey) || 'all';

  const [blobs, setBlobs] = React.useState<JsonBlob[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<FilterKey>(initialFilter);
  const [sort, setSort] = React.useState<SortKey>('updated');
  const [view, setView] = React.useState<'grid' | 'list'>('grid');

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    fetchBlobs();
  }, [user, authLoading, router]);

  const fetchBlobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blobs').select('*').order('updated_at', { ascending: false });
      if (error) throw error;
      setBlobs((data as JsonBlob[]) || []);
    } catch (e) {
      toast({ title: 'Failed to load blobs', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = React.useMemo(() => {
    let result = [...blobs];
    if (filter === 'favorites') result = result.filter((b) => b.is_favorite);
    else if (filter === 'archived') result = result.filter((b) => b.status === 'archived');
    else if (filter === 'shared') result = result.filter((b) => b.visibility === 'shared' || b.share_count > 0);
    else if (filter === 'public') result = result.filter((b) => b.visibility === 'public');
    else if (filter === 'private') result = result.filter((b) => b.visibility === 'private');
    else if (filter === 'recent') {
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      result = result.filter((b) => new Date(b.updated_at).getTime() > dayAgo);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((b) =>
        b.title.toLowerCase().includes(q) ||
        (b.description?.toLowerCase().includes(q) ?? false) ||
        b.tags.some((t) => t.toLowerCase().includes(q)) ||
        JSON.stringify(b.content ?? {}).toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      switch (sort) {
        case 'created': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'title': return a.title.localeCompare(b.title);
        case 'size': return b.size_bytes - a.size_bytes;
        default: return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });
    return result;
  }, [blobs, filter, search, sort]);

  const stats = React.useMemo(() => ({
    total: blobs.length,
    shared: blobs.filter((b) => b.visibility === 'shared' || b.share_count > 0).length,
    publicBlobs: blobs.filter((b) => b.visibility === 'public').length,
    privateBlobs: blobs.filter((b) => b.visibility === 'private').length,
    favorites: blobs.filter((b) => b.is_favorite).length,
    archived: blobs.filter((b) => b.status === 'archived').length,
    totalSize: blobs.reduce((s, b) => s + (b.size_bytes || 0), 0),
  }), [blobs]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('blobs').delete().eq('id', id);
      if (error) throw error;
      setBlobs((prev) => prev.filter((b) => b.id !== id));
      toast({ title: 'Blob deleted' });
    } catch (e) {
      toast({ title: 'Delete failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    }
  };

  const handleDuplicate = async (blob: JsonBlob) => {
    try {
      const { data, error } = await supabase.from('blobs').insert({
        title: `${blob.title} (copy)`, description: blob.description,
        content: blob.content, size_bytes: blob.size_bytes,
        visibility: 'private', status: 'active', tags: blob.tags, user_id: user?.id,
      }).select().single();
      if (error) throw error;
      setBlobs((prev) => [data as JsonBlob, ...prev]);
      toast({ title: 'Blob duplicated' });
    } catch (e) {
      toast({ title: 'Duplicate failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    }
  };

  const handleToggleFavorite = async (blob: JsonBlob) => {
    try {
      const { error } = await supabase.from('blobs').update({ is_favorite: !blob.is_favorite }).eq('id', blob.id);
      if (error) throw error;
      setBlobs((prev) => prev.map((b) => b.id === blob.id ? { ...b, is_favorite: !b.is_favorite } : b));
    } catch (e) {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  const handleArchive = async (blob: JsonBlob) => {
    const newStatus = blob.status === 'archived' ? 'active' : 'archived';
    try {
      const { error } = await supabase.from('blobs').update({ status: newStatus }).eq('id', blob.id);
      if (error) throw error;
      setBlobs((prev) => prev.map((b) => b.id === blob.id ? { ...b, status: newStatus } : b));
      toast({ title: newStatus === 'archived' ? 'Blob archived' : 'Blob restored' });
    } catch (e) {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  const handleDownload = (blob: JsonBlob) => {
    const content = JSON.stringify(blob.content ?? {}, null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${blob.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading) {
    return <div className="flex items-center justify-center h-full"><Skeleton className="h-8 w-8 rounded-full" /></div>;
  }

  const statCards = [
    { label: 'Total Blobs', value: stats.total, icon: FileJson, color: 'text-primary' },
    { label: 'Shared', value: stats.shared, icon: Share2, color: 'text-chart-2' },
    { label: 'Public', value: stats.publicBlobs, icon: Globe, color: 'text-chart-3' },
    { label: 'Private', value: stats.privateBlobs, icon: Lock, color: 'text-chart-4' },
    { label: 'Favorites', value: stats.favorites, icon: Star, color: 'text-chart-5' },
    { label: 'Archived', value: stats.archived, icon: Archive, color: 'text-muted-foreground' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex items-center justify-between gap-4 border-b border-border/50 px-6 py-3 bg-card/30">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search blobs, tags, content..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>
        <Button size="sm" asChild>
          <Link href="/editor/new/"><FilePlus2 className="mr-1.5 h-4 w-4" />New Blob</Link>
        </Button>
      </header>

      <div className="flex-1 overflow-auto scrollbar-thin p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map((stat) => (
            <Card key={stat.label} className="glass-card p-4">
              <stat.icon className={cn('h-4 w-4', stat.color)} />
              <div className="mt-2 text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        <Card className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Storage Usage</span>
            </div>
            <span className="text-sm text-muted-foreground">{formatBytes(stats.totalSize)} / 50 MB</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-chart-2 transition-all"
              style={{ width: `${Math.min((stats.totalSize / (50 * 1024 * 1024)) * 100, 100)}%` }} />
          </div>
        </Card>

        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'favorites', 'shared', 'public', 'private', 'archived', 'recent'] as FilterKey[]).map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)} className="capitalize">{f}</Button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Last Updated</SelectItem>
                <SelectItem value="created">Date Created</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="size">File Size</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center rounded-md border border-border">
              <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-r-none" onClick={() => setView('grid')}><LayoutGrid className="h-4 w-4" /></Button>
              <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9 rounded-l-none" onClick={() => setView('list')}><List className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className={cn('grid gap-4', view === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : view === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((blob) => (
              <BlobCard key={blob.id} blob={blob} onDelete={handleDelete} onDuplicate={handleDuplicate}
                onToggleFavorite={handleToggleFavorite} onArchive={handleArchive} onDownload={handleDownload} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((blob) => (
              <BlobRow key={blob.id} blob={blob} onDelete={handleDelete} onDuplicate={handleDuplicate}
                onToggleFavorite={handleToggleFavorite} onArchive={handleArchive} onDownload={handleDownload} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type BlobActions = {
  blob: JsonBlob;
  onDelete: (id: string) => void;
  onDuplicate: (blob: JsonBlob) => void;
  onToggleFavorite: (blob: JsonBlob) => void;
  onArchive: (blob: JsonBlob) => void;
  onDownload: (blob: JsonBlob) => void;
};

function BlobCard({ blob, onDelete, onDuplicate, onToggleFavorite, onArchive, onDownload }: BlobActions) {
  return (
    <Card className="glass-card p-4 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1" onClick={() => openBlob(blob.id)}>
          <div className="flex items-center gap-2 mb-1">
            <FileJson className="h-4 w-4 text-primary shrink-0" />
            <h3 className="font-semibold text-sm truncate hover:text-primary transition-colors">{blob.title}</h3>
          </div>
          {blob.description && <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{blob.description}</p>}
        </div>
        <BlobMenu blob={blob} onDelete={onDelete} onDuplicate={onDuplicate}
          onToggleFavorite={onToggleFavorite} onArchive={onArchive} onDownload={onDownload} />
      </div>
      <div className="flex flex-wrap items-center gap-1.5 mt-3">
        <VisibilityBadge visibility={blob.visibility} />
        {blob.is_favorite && (
          <Badge variant="outline" className="text-chart-5 border-chart-5/30">
            <Star className="mr-1 h-2.5 w-2.5 fill-chart-5" />Favorite
          </Badge>
        )}
        {blob.status === 'archived' && (
          <Badge variant="outline" className="text-muted-foreground">
            <Archive className="mr-1 h-2.5 w-2.5" />Archived
          </Badge>
        )}
        {blob.tags.slice(0, 2).map((tag) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
      </div>
      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(blob.updated_at).toLocaleDateString()}</span>
        <span>{formatBytes(blob.size_bytes)}</span>
        {blob.share_count > 0 && <span className="flex items-center gap-1"><Share2 className="h-3 w-3" />{blob.share_count}</span>}
        {blob.view_count > 0 && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{blob.view_count}</span>}
      </div>
    </Card>
  );
}

function BlobRow({ blob, onDelete, onDuplicate, onToggleFavorite, onArchive, onDownload }: BlobActions) {
  return (
    <div className="flex items-center gap-3 glass-card rounded-lg p-3 hover:border-primary/30 transition-colors">
      <button onClick={() => onToggleFavorite(blob)} className="shrink-0">
        <Star className={cn('h-4 w-4 transition-colors', blob.is_favorite ? 'fill-chart-5 text-chart-5' : 'text-muted-foreground hover:text-chart-5')} />
      </button>
      <div className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer" onClick={() => openBlob(blob.id)}>
        <FileJson className="h-4 w-4 text-primary shrink-0" />
        <span className="font-medium text-sm truncate hover:text-primary transition-colors">{blob.title}</span>
      </div>
      <VisibilityBadge visibility={blob.visibility} />
      <span className="text-xs text-muted-foreground hidden sm:block">{formatBytes(blob.size_bytes)}</span>
      <span className="text-xs text-muted-foreground hidden md:block">{new Date(blob.updated_at).toLocaleDateString()}</span>
      <BlobMenu blob={blob} onDelete={onDelete} onDuplicate={onDuplicate}
        onToggleFavorite={onToggleFavorite} onArchive={onArchive} onDownload={onDownload} />
    </div>
  );
}

function BlobMenu({ blob, onDelete, onDuplicate, onToggleFavorite, onArchive, onDownload }: BlobActions) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"><MoreVertical className="h-4 w-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onToggleFavorite(blob)}>
          <Star className="mr-2 h-4 w-4" />{blob.is_favorite ? 'Unfavorite' : 'Favorite'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDuplicate(blob)}><Copy className="mr-2 h-4 w-4" />Duplicate</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDownload(blob)}><Download className="mr-2 h-4 w-4" />Download</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onArchive(blob)}>
          {blob.status === 'archived'
            ? <><RotateCcw className="mr-2 h-4 w-4" />Restore</>
            : <><Archive className="mr-2 h-4 w-4" />Archive</>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(blob.id)}>
          <Trash2 className="mr-2 h-4 w-4" />Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function VisibilityBadge({ visibility }: { visibility: string }) {
  if (visibility === 'public') return <Badge variant="outline" className="text-chart-3 border-chart-3/30"><Globe className="mr-1 h-2.5 w-2.5" />Public</Badge>;
  if (visibility === 'shared') return <Badge variant="outline" className="text-chart-2 border-chart-2/30"><Share2 className="mr-1 h-2.5 w-2.5" />Shared</Badge>;
  return <Badge variant="outline" className="text-muted-foreground"><Lock className="mr-1 h-2.5 w-2.5" />Private</Badge>;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
        <FileJson className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold">No blobs found</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">Create your first JSON blob to get started, or try adjusting your filters.</p>
      <Button className="mt-4" asChild><Link href="/editor/new/"><FilePlus2 className="mr-2 h-4 w-4" />Create Blob</Link></Button>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Skeleton className="h-8 w-8 rounded-full" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
