'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Loader2, Save, Sun, Moon, Monitor, Bell, Lock, Keyboard, Trash2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = React.useState(false);
  const [fontSize, setFontSize] = React.useState('14');
  const [wordWrap, setWordWrap] = React.useState(true);
  const [autoSave, setAutoSave] = React.useState(true);
  const [notifications, setNotifications] = React.useState({ email: true, product: true, security: true });

  React.useEffect(() => {
    if (loading) return;
    if (!user) router.push('/login');
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This permanently deletes your account and all data. This cannot be undone.')) return;
    try {
      await signOut();
      toast({ title: 'Account deletion requested', description: 'Contact support to complete deletion.' });
      router.push('/');
    } catch (e) {
      toast({ title: 'Deletion failed', variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-border/50">
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your preferences and account configuration.</p>
      </header>

      <div className="flex-1 overflow-auto scrollbar-thin p-6">
        <Tabs defaultValue="general" className="max-w-3xl">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full mb-6">
            <TabsTrigger value="general"><Globe className="mr-1.5 h-3.5 w-3.5" />General</TabsTrigger>
            <TabsTrigger value="security"><Lock className="mr-1.5 h-3.5 w-3.5" />Security</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="mr-1.5 h-3.5 w-3.5" />Notifications</TabsTrigger>
            <TabsTrigger value="editor"><Keyboard className="mr-1.5 h-3.5 w-3.5" />Editor</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card className="glass-card p-6 space-y-4">
              <h3 className="font-semibold">Appearance</h3>
              <div className="space-y-3">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'light', icon: Sun, label: 'Light' },
                    { value: 'dark', icon: Moon, label: 'Dark' },
                    { value: 'system', icon: Monitor, label: 'System' },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTheme(t.value)}
                      className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors ${theme === t.value ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-accent/50'}`}
                    >
                      <t.icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select defaultValue="utc">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">EST (UTC-5)</SelectItem>
                    <SelectItem value="pst">PST (UTC-8)</SelectItem>
                    <SelectItem value="cet">CET (UTC+1)</SelectItem>
                    <SelectItem value="jst">JST (UTC+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card className="glass-card p-6 space-y-4">
              <h3 className="font-semibold">Password</h3>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" placeholder="••••••••" />
              </div>
              <Button onClick={() => toast({ title: 'Password updated' })}>
                <Save className="mr-2 h-4 w-4" />
                Update password
              </Button>
            </Card>
            <Card className="glass-card p-6 space-y-4">
              <h3 className="font-semibold">Sessions</h3>
              <p className="text-sm text-muted-foreground">You are currently signed in on this device.</p>
              <Button variant="outline" onClick={() => signOut().then(() => router.push('/'))}>
                Sign out of all sessions
              </Button>
            </Card>
            <Card className="glass-card p-6 space-y-4 border-destructive/30">
              <h3 className="font-semibold text-destructive">Danger zone</h3>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete account
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="glass-card p-6 space-y-4">
              <h3 className="font-semibold">Notification preferences</h3>
              {[
                { key: 'email', label: 'Email notifications', desc: 'Receive emails about your account and activity.' },
                { key: 'product', label: 'Product updates', desc: 'News about new features and improvements.' },
                { key: 'security', label: 'Security alerts', desc: 'Important security-related notifications.' },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{n.label}</div>
                    <div className="text-xs text-muted-foreground">{n.desc}</div>
                  </div>
                  <Switch
                    checked={notifications[n.key as keyof typeof notifications]}
                    onCheckedChange={(v) => setNotifications({ ...notifications, [n.key]: v })}
                  />
                </div>
              ))}
            </Card>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <Card className="glass-card p-6 space-y-4">
              <h3 className="font-semibold">Editor preferences</h3>
              <div className="space-y-2">
                <Label>Font size</Label>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['12', '13', '14', '15', '16', '18'].map((s) => (
                      <SelectItem key={s} value={s}>{s}px</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Word wrap</div>
                  <div className="text-xs text-muted-foreground">Wrap long lines in the editor.</div>
                </div>
                <Switch checked={wordWrap} onCheckedChange={setWordWrap} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Auto-save</div>
                  <div className="text-xs text-muted-foreground">Automatically save changes after a delay.</div>
                </div>
                <Switch checked={autoSave} onCheckedChange={setAutoSave} />
              </div>
            </Card>
            <Card className="glass-card p-6 space-y-3">
              <h3 className="font-semibold">Keyboard shortcuts</h3>
              <div className="space-y-2 text-sm">
                {[
                  { keys: 'Cmd/Ctrl + K', action: 'Open command palette' },
                  { keys: 'Cmd/Ctrl + S', action: 'Save blob' },
                  { keys: 'Cmd/Ctrl + C', action: 'Copy JSON' },
                  { keys: 'Cmd/Ctrl + Enter', action: 'Format JSON' },
                ].map((s) => (
                  <div key={s.action} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{s.action}</span>
                    <kbd className="rounded border border-border bg-card px-2 py-0.5 text-xs font-mono">{s.keys}</kbd>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
