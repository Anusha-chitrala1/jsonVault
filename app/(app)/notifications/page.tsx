'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { type Notification } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = React.useState(true);

  React.useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    fetchNotifications();
  }, [user, loading, router]);

  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      setNotifications((data as Notification[]) || []);
    } catch {
      // non-critical
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      if (error) throw error;
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (e) {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
      if (error) throw error;
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast({ title: 'All marked as read' });
    } catch (e) {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div>
          <h1 className="text-xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <Check className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </header>

      <div className="flex-1 overflow-auto scrollbar-thin p-6">
        {loadingNotifs ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
              <Bell className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold">No notifications</h3>
            <p className="text-sm text-muted-foreground mt-1">You have no notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2 max-w-3xl">
            {notifications.map((n) => (
              <Card
                key={n.id}
                className={cn(
                  'glass-card p-4 flex items-start gap-3 transition-colors',
                  !n.is_read && 'border-primary/30 bg-primary/5'
                )}
              >
                <div className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg shrink-0',
                  n.is_read ? 'bg-muted text-muted-foreground' : 'bg-primary/15 text-primary'
                )}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{n.title}</span>
                    {!n.is_read && <Badge className="text-xs">New</Badge>}
                  </div>
                  {n.message && <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>}
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
                {!n.is_read && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleMarkRead(n.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
