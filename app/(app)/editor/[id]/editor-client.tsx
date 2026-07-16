'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Save,
  Copy,
  Download,
  Upload,
  Minimize2,
  Maximize2,
  Check,
  AlertCircle,
  History,
  Share2,
  Tag,
  Eye,
  TreePine,
  Code2,
  Loader2,
  ChevronLeft,
  FileJson,
  X,
} from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { JsonEditor } from '@/components/json-editor';
import { JsonTreeView } from '@/components/json-tree-view';
import { VersionHistoryPanel } from '@/components/version-history-panel';
import { SharePanel } from '@/components/share-panel';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { type JsonBlob, type BlobVersion, computeSize, formatBytes } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const defaultJson = `{
  "name": "my-blob",
  "version": "1.0.0",
  "items": [
    { "id": 1, "label": "First" },
    { "id": 2, "label": "Second" }
  ]
}`;

export default function EditorPageClient() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const blobId = params.id as string;
  const isNew = blobId === 'new';

  const [blob, setBlob] = React.useState<JsonBlob | null>(null);
  const [title, setTitle] = React.useState('Untitled Blob');
  const [description, setDescription] = React.useState('');
  const [content, setContent] = React.useState(defaultJson);
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(!isNew);
  const [versions, setVersions] = React.useState<BlobVersion[]>([]);
  const [showTree, setShowTree] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'versions' | 'share' | 'info'>('info');

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!isNew) fetchBlob();
  }, [user, authLoading, router, blobId, isNew]);

  const fetchBlob = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blobs')
        .select('*')
        .eq('id', blobId)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        toast({ title: 'Blob not found', variant: 'destructive' });
        router.push('/dashboard');
        return;
      }
      const b = data as JsonBlob;
      setBlob(b);
      setTitle(b.title);
      setDescription(b.description ?? '');
      setContent(JSON.stringify(b.content ?? {}, null, 2));
      setTags(b.tags ?? []);
      fetchVersions(b.id);
    } catch (e) {
      toast({
        title: 'Failed to load blob',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async (id: string) => {
    try {
      const { data } = await supabase
        .from('blob_versions')
        .select('*')
        .eq('blob_id', id)
        .order('version_number', { ascending: false });
      setVersions((data as BlobVersion[]) || []);
    } catch {
      // non-critical
    }
  };

  const parsed = React.useMemo(() => {
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  }, [content]);

  React.useEffect(() => {
    try {
      JSON.parse(content);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }, [content]);

  const handleSave = async () => {
    if (error) {
      toast({ title: 'Cannot save invalid JSON', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const size = computeSize(parsed);
      const contentObj = parsed ?? {};

      if (isNew || !blob) {
        const { data, error: insertError } = await supabase
          .from('blobs')
          .insert({
            title,
            description,
            content: contentObj,
            size_bytes: size,
            visibility: 'private',
            status: 'active',
            tags,
            user_id: user?.id,
          })
          .select()
          .single();
        if (insertError) throw insertError;
        const newBlob = data as JsonBlob;
        setBlob(newBlob);
        // Create initial version
        await supabase.from('blob_versions').insert({
          blob_id: newBlob.id,
          content: contentObj,
          size_bytes: size,
          version_number: 1,
          message: 'Initial version',
          user_id: user?.id,
        });
        fetchVersions(newBlob.id);
        toast({ title: 'Blob created', description: 'Your blob has been saved.' });
        router.replace(`/editor/${newBlob.id}`);
      } else {
        const { error: updateError } = await supabase
          .from('blobs')
          .update({
            title,
            description,
            content: contentObj,
            size_bytes: size,
            tags,
            updated_at: new Date().toISOString(),
          })
          .eq('id', blob.id);
        if (updateError) throw updateError;

        const nextVersion = (versions[0]?.version_number ?? 0) + 1;
        await supabase.from('blob_versions').insert({
          blob_id: blob.id,
          content: contentObj,
          size_bytes: size,
          version_number: nextVersion,
          message: 'Auto-saved version',
          user_id: user?.id,
        });
        fetchVersions(blob.id);
        toast({ title: 'Blob saved', description: `Version ${nextVersion} created.` });
      }
      setDirty(false);
    } catch (e) {
      toast({
        title: 'Save failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Auto-save (debounced) - only for existing blobs
  React.useEffect(() => {
    if (!blob || error || !dirty) return;
    const timer = setTimeout(() => {
      handleSave();
    }, 5000);
    return () => clearTimeout(timer);
  }, [content, title, description, tags, dirty, blob, error]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied to clipboard' });
  };

  const handleDownload = () => {
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      try {
        JSON.parse(text);
        setContent(text);
        setDirty(true);
        toast({ title: 'File imported' });
      } catch {
        toast({ title: 'Invalid JSON file', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
  };

  const handleFormat = () => {
    try {
      setContent(JSON.stringify(JSON.parse(content), null, 2));
    } catch {
      toast({ title: 'Cannot format invalid JSON', variant: 'destructive' });
    }
  };

  const handleMinify = () => {
    try {
      setContent(JSON.stringify(JSON.parse(content)));
    } catch {
      toast({ title: 'Cannot minify invalid JSON', variant: 'destructive' });
    }
  };

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput('');
      setDirty(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      try {
        JSON.parse(text);
        setContent(text);
        setDirty(true);
        toast({ title: 'File dropped' });
      } catch {
        toast({ title: 'Invalid JSON file', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreVersion = (version: BlobVersion) => {
    setContent(JSON.stringify(version.content ?? {}, null, 2));
    setDirty(true);
    toast({ title: `Restored version ${version.version_number}` });
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <header className="flex items-center justify-between gap-2 border-b border-border/50 px-4 py-2.5 bg-card/30">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => router.push('/dashboard')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <FileJson className="h-4 w-4 text-primary shrink-0" />
          <Input
            value={title}
            onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
            className="h-8 max-w-xs border-transparent bg-transparent hover:border-border focus-visible:border-border"
          />
          {dirty && <span className="text-xs text-muted-foreground">unsaved</span>}
          {error && (
            <Badge variant="outline" className="text-destructive border-destructive/30">
              <AlertCircle className="mr-1 h-3 w-3" />
              Error
            </Badge>
          )}
          {!error && parsed !== null && (
            <Badge variant="outline" className="text-primary border-primary/30">
              <Check className="mr-1 h-3 w-3" />
              Valid
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleFormat} title="Format">
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleMinify} title="Minify">
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy} title="Copy">
            <Copy className="h-4 w-4" />
          </Button>
          <label className="cursor-pointer">
            <input type="file" accept=".json,application/json" className="hidden" onChange={handleUpload} />
            <Button variant="ghost" size="sm" asChild>
              <span title="Upload JSON">
                <Upload className="h-4 w-4" />
              </span>
            </Button>
          </label>
          <Button variant="ghost" size="sm" onClick={handleDownload} title="Download">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowTree(!showTree)} title="Toggle tree">
            {showTree ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !!error}>
            {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
            Save
          </Button>
        </div>
      </header>

      {/* Editor area */}
      <div
        className="flex-1 overflow-hidden"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <PanelGroup direction="horizontal">
          <Panel defaultSize={55} minSize={30}>
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/50 bg-card/20">
                <Code2 className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Editor</span>
                <span className="ml-auto text-xs text-muted-foreground font-mono">
                  {formatBytes(new Blob([content]).size)}
                </span>
              </div>
              <div className="flex-1">
                <JsonEditor value={content} onChange={(v) => { setContent(v); setDirty(true); }} />
              </div>
            </div>
          </Panel>

          {showTree && (
            <>
              <PanelResizeHandle className="w-1 bg-border/50 hover:bg-primary/50 transition-colors" />
              <Panel defaultSize={25} minSize={15}>
                <div className="h-full flex flex-col">
                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/50 bg-card/20">
                    <TreePine className="h-3.5 w-3.5 text-chart-1" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tree View</span>
                  </div>
                  <div className="flex-1 overflow-auto scrollbar-thin p-2">
                    {parsed !== null && (
                      <JsonTreeView
                        data={parsed}
                        onChange={(d) => {
                          setContent(JSON.stringify(d, null, 2));
                          setDirty(true);
                        }}
                      />
                    )}
                    {parsed === null && (
                      <div className="text-sm text-muted-foreground italic p-4">
                        Fix JSON errors to see the tree view
                      </div>
                    )}
                  </div>
                </div>
              </Panel>
            </>
          )}

          <PanelResizeHandle className="w-1 bg-border/50 hover:bg-primary/50 transition-colors" />
          <Panel defaultSize={20} minSize={15}>
            <div className="h-full flex flex-col overflow-hidden">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="h-full flex flex-col">
                <TabsList className="grid grid-cols-3 rounded-none border-b border-border/50 bg-card/20">
                  <TabsTrigger value="info" className="text-xs">
                    <Eye className="mr-1 h-3 w-3" />
                    Info
                  </TabsTrigger>
                  <TabsTrigger value="versions" className="text-xs">
                    <History className="mr-1 h-3 w-3" />
                    History
                  </TabsTrigger>
                  <TabsTrigger value="share" className="text-xs">
                    <Share2 className="mr-1 h-3 w-3" />
                    Share
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="flex-1 overflow-auto scrollbar-thin p-4 space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => { setDescription(e.target.value); setDirty(true); }}
                      placeholder="Add a description..."
                      rows={3}
                      className="resize-none text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                        placeholder="Add tag..."
                        className="text-sm"
                      />
                      <Button size="sm" variant="outline" onClick={handleAddTag}>
                        <Tag className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs gap-1">
                          {t}
                          <button
                            onClick={() => { setTags(tags.filter((x) => x !== t)); setDirty(true); }}
                            className="ml-0.5 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {blob && (
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <div className="text-xs text-muted-foreground">Details</div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{new Date(blob.created_at).toLocaleDateString()}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Updated</span><span>{new Date(blob.updated_at).toLocaleDateString()}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Size</span><span>{formatBytes(blob.size_bytes)}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Views</span><span>{blob.view_count}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Shares</span><span>{blob.share_count}</span></div>
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="versions" className="flex-1 overflow-hidden mt-0">
                  <VersionHistoryPanel
                    versions={versions}
                    currentContent={content}
                    onRestore={handleRestoreVersion}
                    blobId={blob?.id}
                  />
                </TabsContent>
                <TabsContent value="share" className="flex-1 overflow-auto scrollbar-thin p-4 mt-0">
                  <SharePanel blobId={blob?.id} onShared={() => {
                    if (blob) {
                      setBlob({ ...blob, share_count: blob.share_count + 1 });
                    }
                  }} />
                </TabsContent>
              </Tabs>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Status bar */}
      <footer className="flex items-center justify-between px-4 py-1 border-t border-border/50 bg-card/30 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {error ? (
            <span className="text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {error}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-primary">
              <Check className="h-3 w-3" />
              Valid JSON
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span>{content.split('\n').length} lines</span>
          <span>{formatBytes(new Blob([content]).size)}</span>
        </div>
      </footer>
    </div>
  );
}
