'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Key, Plus, Trash2, Copy, Loader2, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { type ApiKey } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

export default function ApiKeysPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [keys, setKeys] = React.useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = React.useState(true);
  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newKey, setNewKey] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    fetchKeys();
  }, [user, loading, router]);

  const fetchKeys = async () => {
    setLoadingKeys(true);
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setKeys((data as ApiKey[]) || []);
    } catch (e) {
      toast({ title: 'Failed to load API keys', variant: 'destructive' });
    } finally {
      setLoadingKeys(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const rawKey = `jv_${crypto.randomUUID().replace(/-/g, '')}`;
      const prefix = rawKey.slice(0, 12);
      const keyHash = btoa(rawKey);

      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          name: newName || 'Untitled Key',
          key_hash: keyHash,
          prefix,
          user_id: user?.id,
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;
      setKeys((prev) => [data as ApiKey, ...prev]);
      setNewKey(rawKey);
      setNewName('');
      toast({ title: 'API key created' });
    } catch (e) {
      toast({
        title: 'Failed to create key',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('api_keys').delete().eq('id', id);
      if (error) throw error;
      setKeys((prev) => prev.filter((k) => k.id !== id));
      toast({ title: 'Key deleted' });
    } catch (e) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: 'Copied to clipboard' });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div>
          <h1 className="text-xl font-bold">API Keys</h1>
          <p className="text-sm text-muted-foreground">Manage keys for programmatic access to your blobs.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setNewKey(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Generate Key</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{newKey ? 'Your new API key' : 'Create API key'}</DialogTitle>
            </DialogHeader>
            {newKey ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Copy this key now. You will not be able to see it again.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono bg-card rounded px-2 py-1.5 break-all">{newKey}</code>
                    <Button size="icon" variant="outline" onClick={() => copyKey(newKey)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button>Done</Button>
                  </DialogClose>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Key name</Label>
                  <Input id="key-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. CI Pipeline" />
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={handleCreate} disabled={creating}>
                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex-1 overflow-auto scrollbar-thin p-6">
        {loadingKeys ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
              <Key className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold">No API keys yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Generate an API key to access your blobs programmatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            {keys.map((key) => (
              <Card key={key.id} className="glass-card p-4 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <Key className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{key.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs font-mono text-muted-foreground">{key.prefix}...</code>
                    {key.is_active ? (
                      <Badge variant="outline" className="text-primary border-primary/30 text-xs">
                        <Check className="mr-1 h-2.5 w-2.5" />Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground text-xs">Inactive</Badge>
                    )}
                    {key.last_used_at && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(key.last_used_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(key.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
