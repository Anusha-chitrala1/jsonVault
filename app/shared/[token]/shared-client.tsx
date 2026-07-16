'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Braces, Lock, Eye, Edit3, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { JsonEditor } from '@/components/json-editor';
import { JsonTreeView } from '@/components/json-tree-view';
import { supabase } from '@/lib/supabase';
import { type Share, type JsonBlob, formatBytes } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

export default function SharedBlobPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = React.useState(true);
  const [share, setShare] = React.useState<Share | null>(null);
  const [blob, setBlob] = React.useState<JsonBlob | null>(null);
  const [content, setContent] = React.useState('');
  const [needsPassword, setNeedsPassword] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [authed, setAuthed] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchShare();
  }, [token]);

  const fetchShare = async (pwd?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: shareData, error: shareError } = await supabase
        .from('shares')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .maybeSingle();
      if (shareError) throw shareError;
      if (!shareData) {
        setError('This share link is invalid or has been disabled.');
        setLoading(false);
        return;
      }
      const s = shareData as Share;

      if (s.expires_at && new Date(s.expires_at) < new Date()) {
        setError('This share link has expired.');
        setLoading(false);
        return;
      }

      if (s.is_password_protected && !authed) {
        if (pwd) {
          if (btoa(pwd) !== s.password_hash) {
            setError('Incorrect password.');
            setLoading(false);
            return;
          }
          setAuthed(true);
        } else {
          setShare(s);
          setNeedsPassword(true);
          setLoading(false);
          return;
        }
      }

      setShare(s);

      const { data: blobData, error: blobError } = await supabase
        .from('blobs')
        .select('*')
        .eq('id', s.blob_id)
        .maybeSingle();
      if (blobError) throw blobError;
      if (!blobData) {
        setError('The shared blob could not be found.');
        setLoading(false);
        return;
      }
      const b = blobData as JsonBlob;
      setBlob(b);
      setContent(JSON.stringify(b.content ?? {}, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load shared blob');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!blob || !share || share.link_type !== 'editable') return;
    try {
      const parsed = JSON.parse(content);
      const { error } = await supabase
        .from('blobs')
        .update({ content: parsed, updated_at: new Date().toISOString() })
        .eq('id', blob.id);
      if (error) throw error;
      toast({ title: 'Changes saved' });
    } catch (e) {
      toast({
        title: 'Save failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Cannot access this blob</h1>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (needsPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold">Password required</h1>
            <p className="text-sm text-muted-foreground mt-1">
              This shared blob is password protected.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchShare(password); }}
              placeholder="Enter password"
            />
          </div>
          <Button className="w-full" onClick={() => fetchShare(password)}>
            Unlock
          </Button>
        </div>
      </div>
    );
  }

  const parsed = (() => { try { return JSON.parse(content); } catch { return null; } })();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/30">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Braces className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm">
            Json<span className="text-primary">Vault</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {share?.link_type === 'editable' ? (
            <Button size="sm" onClick={handleSave}>
              <Edit3 className="mr-1.5 h-4 w-4" />
              Save changes
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              Read only
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col p-4">
        <div className="mb-3">
          <h1 className="text-lg font-semibold">{blob?.title}</h1>
          {blob?.description && <p className="text-sm text-muted-foreground">{blob.description}</p>}
        </div>
        <div className="grid md:grid-cols-2 gap-4 flex-1 min-h-0">
          <div className="h-[60vh] glass-card rounded-lg overflow-hidden">
            <JsonEditor
              value={content}
              onChange={(v) => setContent(v)}
              readOnly={share?.link_type !== 'editable'}
            />
          </div>
          <div className="h-[60vh] glass-card rounded-lg overflow-auto p-3 scrollbar-thin">
            <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Tree View</div>
            {parsed !== null && <JsonTreeView data={parsed} />}
          </div>
        </div>
        <div className="mt-3 text-xs text-muted-foreground font-mono">
          {formatBytes(new Blob([content]).size)}
        </div>
      </div>
    </div>
  );
}
