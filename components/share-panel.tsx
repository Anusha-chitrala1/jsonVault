'use client';

import * as React from 'react';
import {
  Share2,
  Copy,
  Link2,
  Lock,
  Globe,
  Eye,
  Edit3,
  Calendar,
  QrCode,
  Trash2,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { type Share } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SharePanelProps {
  blobId?: string;
  onShared?: () => void;
}

export function SharePanel({ blobId, onShared }: SharePanelProps) {
  const [shares, setShares] = React.useState<Share[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [linkType, setLinkType] = React.useState<'readonly' | 'editable'>('readonly');
  const [passwordProtected, setPasswordProtected] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [expiryDays, setExpiryDays] = React.useState<number | null>(null);
  const [showQR, setShowQR] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (blobId) fetchShares();
  }, [blobId]);

  const fetchShares = async () => {
    if (!blobId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shares')
        .select('*')
        .eq('blob_id', blobId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setShares((data as Share[]) || []);
    } catch {
      // non-critical
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!blobId) return;
    setCreating(true);
    try {
      const expiresAt = expiryDays
        ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase
        .from('shares')
        .insert({
          blob_id: blobId,
          link_type: linkType,
          is_password_protected: passwordProtected,
          password_hash: passwordProtected ? btoa(password) : null,
          expires_at: expiresAt,
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;
      setShares((prev) => [data as Share, ...prev]);
      onShared?.();
      toast({ title: 'Share link created' });
      setPassword('');
      setPasswordProtected(false);
    } catch (e) {
      toast({
        title: 'Failed to create link',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (share: Share) => {
    try {
      const { error } = await supabase
        .from('shares')
        .update({ is_active: !share.is_active })
        .eq('id', share.id);
      if (error) throw error;
      setShares((prev) =>
        prev.map((s) => (s.id === share.id ? { ...s, is_active: !s.is_active } : s))
      );
    } catch (e) {
      toast({
        title: 'Update failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (share: Share) => {
    try {
      const { error } = await supabase.from('shares').delete().eq('id', share.id);
      if (error) throw error;
      setShares((prev) => prev.filter((s) => s.id !== share.id));
      toast({ title: 'Link deleted' });
    } catch (e) {
      toast({
        title: 'Delete failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copied' });
  };

  if (!blobId) {
    return (
      <div className="text-center py-8">
        <Share2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Save your blob to start sharing it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create new link */}
      <div className="space-y-3 p-3 rounded-lg border border-border/50 bg-card/20">
        <div className="text-sm font-semibold">Create share link</div>
        <div className="space-y-2">
          <Label className="text-xs">Link type</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setLinkType('readonly')}
              className={cn(
                'flex items-center gap-2 rounded-md border p-2 text-xs transition-colors',
                linkType === 'readonly'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:bg-accent/50'
              )}
            >
              <Eye className="h-3.5 w-3.5" />
              Read only
            </button>
            <button
              onClick={() => setLinkType('editable')}
              className={cn(
                'flex items-center gap-2 rounded-md border p-2 text-xs transition-colors',
                linkType === 'editable'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:bg-accent/50'
              )}
            >
              <Edit3 className="h-3.5 w-3.5" />
              Editable
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="pwd" className="text-xs flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            Password protect
          </Label>
          <Switch id="pwd" checked={passwordProtected} onCheckedChange={setPasswordProtected} />
        </div>
        {passwordProtected && (
          <Input
            type="text"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-8 text-sm"
          />
        )}
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            Expiry
          </Label>
          <div className="grid grid-cols-4 gap-1.5">
            {[null, 1, 7, 30].map((d) => (
              <button
                key={String(d)}
                onClick={() => setExpiryDays(d)}
                className={cn(
                  'rounded-md border p-1.5 text-xs transition-colors',
                  expiryDays === d
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:bg-accent/50'
                )}
              >
                {d === null ? 'Never' : `${d}d`}
              </button>
            ))}
          </div>
        </div>
        <Button className="w-full" size="sm" onClick={handleCreate} disabled={creating}>
          {creating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Link2 className="mr-1.5 h-4 w-4" />}
          Generate link
        </Button>
      </div>

      {/* Existing links */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Active links {shares.length > 0 && `(${shares.length})`}
        </div>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : shares.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No share links yet.</p>
        ) : (
          shares.map((share) => {
            const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/shared/${share.token}`;
            const expired = share.expires_at && new Date(share.expires_at) < new Date();
            return (
              <div key={share.id} className="rounded-lg border border-border/50 p-2.5 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {share.link_type === 'readonly' ? (
                      <><Eye className="mr-1 h-2.5 w-2.5" />Read only</>
                    ) : (
                      <><Edit3 className="mr-1 h-2.5 w-2.5" />Editable</>
                    )}
                  </Badge>
                  {share.is_password_protected && (
                    <Badge variant="outline" className="text-xs">
                      <Lock className="mr-1 h-2.5 w-2.5" />Protected
                    </Badge>
                  )}
                  {expired && (
                    <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
                      Expired
                    </Badge>
                  )}
                  {!share.is_active && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Disabled
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Input
                    readOnly
                    value={url}
                    className="h-8 text-xs font-mono"
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => copyLink(share.token)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => setShowQR(showQR === share.id ? null : share.id)}>
                    <QrCode className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {showQR === share.id && (
                  <div className="flex justify-center p-2 bg-white rounded-lg">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`}
                      alt="QR Code"
                      width={120}
                      height={120}
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Switch
                      checked={share.is_active}
                      onCheckedChange={() => handleToggle(share)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {share.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDelete(share)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
