'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Calendar, HardDrive, Crown, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { formatBytes } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [blobCount, setBlobCount] = React.useState(0);
  const [totalSize, setTotalSize] = React.useState(0);

  React.useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    setName(user.user_metadata?.name || '');
    setBio(user.user_metadata?.bio || '');
    fetchStats();
  }, [user, loading, router]);

  const fetchStats = async () => {
    try {
      const { data } = await supabase.from('blobs').select('size_bytes');
      setBlobCount(data?.length ?? 0);
      setTotalSize(data?.reduce((s, b) => s + (b.size_bytes || 0), 0) ?? 0);
    } catch {}
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name, bio },
      });
      if (error) throw error;
      toast({ title: 'Profile updated' });
    } catch (e) {
      toast({
        title: 'Update failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const initials = (name || user?.email || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full overflow-auto scrollbar-thin">
      <header className="px-6 py-4 border-b border-border/50">
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your public profile and account info.</p>
      </header>

      <div className="p-6 space-y-6 max-w-3xl">
        {/* Profile card */}
        <Card className="glass-card p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/15 text-primary text-xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{name || 'Unnamed'}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="secondary" className="mt-2 gap-1">
                <Crown className="h-3 w-3" />
                Free Plan
              </Badge>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="glass-card p-4">
            <HardDrive className="h-4 w-4 text-primary mb-2" />
            <div className="text-2xl font-bold">{formatBytes(totalSize)}</div>
            <div className="text-xs text-muted-foreground">Storage used</div>
          </Card>
          <Card className="glass-card p-4">
            <User className="h-4 w-4 text-chart-2 mb-2" />
            <div className="text-2xl font-bold">{blobCount}</div>
            <div className="text-xs text-muted-foreground">Total blobs</div>
          </Card>
          <Card className="glass-card p-4">
            <Calendar className="h-4 w-4 text-chart-3 mb-2" />
            <div className="text-2xl font-bold">
              {new Date(user?.created_at ?? Date.now()).toLocaleDateString()}
            </div>
            <div className="text-xs text-muted-foreground">Joined</div>
          </Card>
        </div>

        {/* Edit form */}
        <Card className="glass-card p-6 space-y-4">
          <h3 className="font-semibold">Edit profile</h3>
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ''} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell us about yourself..." />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save changes
          </Button>
        </Card>
      </div>
    </div>
  );
}
